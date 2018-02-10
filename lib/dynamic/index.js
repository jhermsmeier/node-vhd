var VHD = require( '../vhd' )
var series = require( 'fastseries' )({ results: true })
var parallel = require( 'fastparallel' )({ results: true })
var debug = require( 'debug' )( 'vhd:dynamic' )

/**
 * Dynamic Disk
 * @constructor
 * @memberOf VHD
 * @param {String} [path] - image file path
 * @param {Object} [options]
 * @param {Number} [options.blockSize=VHD.BLOCK_SIZE] - Block size in bytes
 * @param {String} [options.path] - image file path
 * @param {String} [options.flags='r'] - image file open flags
 * @param {Number} [options.mode=0o666] - image file mode
 * @param {Object} [options.fs=require('fs')] - custom filesystem API
 */
function Dynamic( path, options ) {

  if( !(this instanceof Dynamic) )
    return new Dynamic( path, options )

  if( path != null && typeof path !== 'string' ) {
    options = path
    path = null
  }

  options = options || {}

  /** @type {Number} Block size */
  this.blockSize = options.blockSize || VHD.BLOCK_SIZE

  /** @type {String} Image file descriptor */
  this.fd = options.fd || null
  /** @type {String} Image file path */
  this.path = path || options.path
  /** @type {String} File open() flags */
  this.flags = options.flags || 'r'
  /** @type {String} File open() mode */
  this.mode = options.mode || null
  /** @type {Object} Filesystem API */
  this.fs = options.fs || require( 'fs' )

  /** @type {VHD.Header} Header */
  this.header = new VHD.Header()
  /** @type {VHD.Footer} Footer */
  this.footer = new VHD.Footer()
  /** @type {VHD.AllocationTable} Block Allocation Table (BAT) */
  this.table = new VHD.AllocationTable()

  Object.defineProperty( this, 'fs', {
    enumerable: false
  })

}

Dynamic.ReadStream = require( './read-stream' )
Dynamic.SparseReadStream = require( './sparse-read-stream' )

Dynamic.createReadStream = function( image, options ) {
  return new Dynamic.ReadStream( image, options )
}

Dynamic.createSparseReadStream = function( image, options ) {
  return new Dynamic.SparseReadStream( image, options )
}

/**
 * Dynamic Disk Prototype
 * @type {Object}
 * @ignore
 */
Dynamic.prototype = {

  constructor: Dynamic,

  get size() {
    return this.header.maxTableEntries * this.header.sectorSize
  },

  get sectorSize() {
    return this.header.sectorSize
  },

  get blocksPerSector() {
    return this.sectorSize / this.blockSize
  },

  get bitmapBlocks() {
    return Math.ceil( this.blocksPerSector / this.blockSize / 8 )
  },

  get dataOffset() {
    return this.header.tableOffset + ( this.header.maxTableEntries * 4 )
  },

  sectorNumber: function( lba ) {
    return Math.floor( lba / this.blocksPerSector )
  },

  blockInSector: function( lba ) {
    return lba % this.blocksPerSector
  },

  createReadStream( options ) {
    options = options || {}
    options.autoClose = false
    return new Dynamic.ReadStream( this, options )
  },

  createSparseReadStream( options ) {
    options = options || {}
    options.autoClose = false
    return new Dynamic.SparseReadStream( this, options )
  },

  /**
   * Read & parse the VHD header
   * @param {Function} callback( error, header )
   * @return {VHD.Dynamic}
   */
  readHeader: function( callback ) {

    var position = VHD.FOOTER_SIZE
    var length = VHD.HEADER_SIZE
    var buffer = Buffer.alloc( length )
    var offset = 0

    debug( 'read_header %s, %s', offset, length )

    this.fs.read( this.fd, buffer, offset, length, position, ( error, bytesRead, buffer ) => {

      if( error ) return callback.call( this, error )

      if( bytesRead !== length ) {
        error = new Error( 'Bytes read mismatch: ' + bytesRead + ' != 512' )
        return callback.call( this, error )
      }

      try { this.header.parse( buffer ) }
      catch( e ) { return callback.call( this, e ) }

      callback.call( this, null, this.header )

    })

    return this

  },

  /**
   * Read & parse the VHD footer
   * @param {Function} callback( error, footer )
   * @return {VHD.Dynamic}
   */
  readFooter: function( callback ) {

    var position = 0
    var length = VHD.FOOTER_SIZE
    var buffer = Buffer.alloc( length )
    var offset = 0

    debug( 'read_footer %s, %s', offset, length )

    this.fs.read( this.fd, buffer, offset, length, position, ( error, bytesRead, buffer ) => {

      if( error ) return callback.call( this, error )

      if( bytesRead !== length ) {
        error = new Error( 'Bytes read mismatch: ' + bytesRead + ' != 512' )
        return callback.call( this, error )
      }

      try { this.footer.parse( buffer ) }
      catch( e ) { return callback.call( this, e ) }

      callback.call( this, null, this.footer )

    })

    return this

  },

  /**
   * Read & parse the VHD Allocation Table
   * @param {Function} callback( error, table )
   * @return {VHD.Dynamic}
   */
  readAllocationTable: function( callback ) {

    var position = this.header.tableOffset
    var length = this.header.maxTableEntries * 4
    var buffer = Buffer.alloc( length )
    var offset = 0

    debug( 'read_alloc_table %s, %s', offset, length )

    this.fs.read( this.fd, buffer, offset, length, position, ( error, bytesRead, buffer ) => {

      if( error ) return callback.call( this, error )

      if( bytesRead !== length ) {
        error = new Error( 'Bytes read mismatch: ' + bytesRead + ' != 512' )
        return callback.call( this, error )
      }

      try { this.table.parse( buffer ) }
      catch( e ) { return callback.call( this, e ) }

      callback.call( this, null, this.table )

    })

    return this

  },

  /**
   * Open the VHD image
   * @param {Function} callback( error )
   * @return {VHD.Dynamic}
   */
  open: function( callback ) {

    debug( 'open' )

    series( this, [
      function open( next ) {
        if( this.fd != null ) return next()
        this.fs.open( this.path, this.flags, this.mode, ( error, fd ) => {
          this.fd = fd || null
          next( error )
        })
      },
      this.readHeader,
      this.readFooter,
      this.readAllocationTable,
    ], null, ( error ) => {
      debug( 'open', error )
      callback.call( this, error )
    })

    return this

  },

  /**
   * Read `length` bytes from a given `offset`
   * @param {Number} offset
   * @param {Number} length
   * @param {Function} callback(error, bytesRead, buffer)
   */
  read: function( position, length, callback ) {

    if( length % this.blockSize !== 0 ) {
      return callback.call( this, new Error( 'Buffer length not multiple of block size' ) )
    }

    var self = this

    debug( 'read %s %s', position, length )

    var buffer = Buffer.alloc( length )
    offset = 0

    this.fs.read( this.fd, buffer, offset, length, position, ( error, bytesRead, buffer ) => {
      callback.call( this, error, bytesRead, buffer )
    })

  },

  write: function( buffer, position, callback ) {

    if( buffer.length % this.blockSize !== 0 ) {
      return callback.call( this, new Error( 'Buffer length not multiple of block size' ) )
    }

    var self = this

    debug( 'write %s %s', offset, buffer.length )

    var length = buffer.length
    var offset = 0

    this.fs.write( this.fd, buffer, offset, length, position, ( error, bytesWritten, buffer ) => {
      callback.call( this, error, bytesWritten, buffer )
    })

  },

  /**
   * Close the VHD image
   * @param {Function} callback( error )
   * @return {VHD.Dynamic}
   */
  close: function( callback ) {

    this.fs.close( this.fd, ( error ) => {
      callback.call( this, error )
    })

    return this

  },

  /**
   * Create a bounded partition of the VHD image
   * @param {Object} options
   * @param {Number} options.firstLBA
   * @param {Number} options.lastLBA
   * @return {VHD.Dynamic}
   */
  partition: function( options ) {
    debug( 'partition', options )
    // TODO: Think about moving partitioning logic into `disk` module,
    // since the only additional logic is bounds checking, it wouldn't
    // need to be duplicated in everything that implements the `blockdevice` API
  },

  readSectorBitmap: function( sector, callback ) {
    var position = this.table.sectors[ sector ] * this.blockSize
    var length = this.bitmapBlocks * this.blockSize
    debug( 'read_sector_bitmap %s (%s)', sector, this.table.sectors[ sector ] )
    this.read( position, length, callback )
  },

  readSectorBlocks: function( sector, fromBlock, toBlock, callback ) {

    fromBlock = fromBlock || 0
    toBlock = toBlock || 0

    if( toBlock >= this.blocksPerSector || fromBlock >= this.blocksPerSector ) {
      return callback.call( this, new Error( 'Blocks not in sector ' + sector ) )
    }

    debug( 'read_sector %s (%s -> %s)', sector, fromBlock, toBlock )

    var length = ( toBlock - fromBlock ) * this.blockSize
    var position = ( this.table.sectors[ sector ] + this.bitmapBlocks + fromBlock ) * this.blockSize

    if( this.table.needsAllocation( sector ) ) {
      var buffer = new Buffer( length )
      buffer.fill(0)
      return process.nextTick(() => {
        callback.call( this, null, length, buffer )
      })
    }

    this.read( position, length, callback )

  },

  /**
   * Read from one LBA to another
   * @param {Number} fromLBA
   * @param {Number} toLBA
   * @param {Buffer} [buffer]
   * @param {Function} callback( error, buffer, bytesRead )
   * @return {VHD.Dynamic}
   */
  readBlocks: function( fromLBA, toLBA, buffer, callback ) {

    if( typeof buffer === 'function' ) {
      callback = buffer
      buffer = null
    }

    debug( 'read_blocks %s %s', fromLBA, toLBA )

    var blockCount = toLBA - fromLBA
    var sectorCount = Math.ceil( blockCount / this.blocksPerSector )
    var buffer = new Buffer( blockCount * this.blockSize )

    var fromSector = Math.floor( fromLBA / this.blocksPerSector )
    var toSector = Math.floor( toLBA / this.blocksPerSector )

    var readQueue = []
    var rangeQueue = []
    var blockOffset = 0
    var bytesReadTotal = 0

    buffer.fill( 0 )

    var readSector = ( next ) => {
      var read = rangeQueue.shift()
      this.readSectorBlocks( read.sector, read.start, read.end, ( error, bytesRead, bytes ) => {
        if( error ) return next( error )
        bytes.copy( buffer, blockOffset )
        blockOffset += bytes.length
        bytesReadTotal += bytesRead
        next()
      })
    }

    var from = fromLBA
    var to = -1
    var howMany = 0

    for( sector = fromSector; sector <= toSector; sector++ ) {
      from = from || fromLBA
      howMany = this.blocksPerSector - ( from % this.blocksPerSector )
      howMany = Math.min( howMany - 1, blockCount )
      to = from + howMany
      readQueue.push( readSector )
      rangeQueue.push({
        sector: sector,
        start: from % this.blocksPerSector,
        end: to % this.blocksPerSector,
      })
      blockCount = blockCount - howMany
      from += howMany + 1
    }

    series( this, readQueue, null, function( error ) {
      callback.call( this, error, buffer, bytesReadTotal )
    })

    return this

  },

  /**
   * Writes data starting at a given LBA
   * @param {Number} fromLBA
   * @param {Buffer} buffer
   * @param {Function} callback( error, bytesWritten )
   * @return {VHD.Dynamic}
   */
  writeBlocks: function( fromLBA, buffer, callback ) {
    return this.write( buffer, fromLBA * this.blockSize, callback )
  },

}

// Exports
module.exports = Dynamic
