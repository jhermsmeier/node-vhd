var VHD = require( '../vhd' )
var Emitter = require( 'events' ).EventEmitter
var inherit = require( 'bloodline' )
var series = require( 'fastseries' )({ results: true })
var parallel = require( 'fastparallel' )({ results: true })
var File = require( 'fabl' )
var debug = require( 'debug' )( 'vhd:dynamic' )

/**
 * Dynamic Disk
 * @constructor
 * @param {Object} options
 */
function Dynamic( options ) {

  if( !(this instanceof Dynamic) )
    return new Dynamic( options )

  Emitter.call( this )

  this.size = 0

  // Default sector size is 2 MB, a sector
  // containing 4096 512 byte blocks
  this.sectorSize = 512 * 4096
  this.blockSize = 512
  this.blocksPerSector = 0
  this.bitmapBlocks = 0
  this.dataOffset = 0

  // TODO: Add `mode` option (read-only/write/etc.)
  this.path = options.path

  this.image = new File( this.path )
  this.header = new VHD.Header()
  this.footer = new VHD.Footer()
  this.table = new VHD.AllocationTable()

  Object.defineProperty( this, 'image', {
    enumerable: false
  })

}

/**
 * Dynamic Disk Prototype
 * @type {Object}
 * @ignore
 */
Dynamic.prototype = {

  constructor: Dynamic,

  sectorNumber: function( lba ) {
    return Math.floor( lba / this.blocksPerSector )
  },

  blockInSector: function( lba ) {
    return lba % this.blocksPerSector
  },

  /**
   * Read & parse the VHD header
   * @param {Function} callback( error, header )
   * @return {VHD.Dynamic}
   */
  readHeader: function( callback ) {

    var offset = VHD.FOOTER_SIZE
    var length = VHD.HEADER_SIZE

    debug( 'read_header %s, %s', offset, length )

    this.image.read( offset, length, ( error, bytesRead, buffer ) => {

      if( error ) return callback.call( this, error )

      if( bytesRead !== length ) {
        error = new Error( 'Bytes read mismatch: ' + bytesRead + ' != 512' )
        return callback.call( this, error )
      }

      try { this.header.parse( buffer ) }
      catch( e ) { return callback.call( this, e ) }

      this.sectorSize = this.header.sectorSize
      this.size = this.header.maxTableEntries * this.header.sectorSize
      this.blocksPerSector = this.sectorSize / this.blockSize
      this.bitmapBlocks = Math.ceil( this.blocksPerSector / this.blockSize / 8 )
      this.dataOffset = this.header.tableOffset + ( this.header.maxTableEntries * 4 )

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

    // TODO: Store footer offsets & length in static var (?)
    // i.e. VHD.FOOTER_BYTES = 512
    var offset = 0
    var length = 512

    debug( 'read_footer %s, %s', offset, length )

    this.image.read( offset, length, ( error, bytesRead, buffer ) => {
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

    var offset = this.header.tableOffset
    var length = this.header.maxTableEntries * 4

    debug( 'read_alloc_table %s, %s', offset, length )

    this.image.read( offset, length, ( error, bytesRead, buffer ) => {
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
        this.image.end = void 0
        this.image.open( 'r+', next )
      },
      this.readHeader,
      this.readFooter,
      this.readAllocationTable,
    ], null, ( error ) => {
      debug( 'open', error )
      this.emit( 'open' )
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
  read: function( offset, length, callback ) {

    if( length % this.blockSize !== 0 )
      return callback.call( this, new Error( 'Buffer length not multiple of block size' ) )

    var self = this

    debug( 'read %s %s', offset, length )

    this.image.read( offset, length, function( error, bytesRead, buffer ) {
      // debug( 'read %s', bytesRead )
      callback.call( self, error, buffer, bytesRead )
    })

  },

  write: function( buffer, offset, callback ) {

    if( buffer.length % this.blockSize !== 0 )
      return callback.call( this, new Error( 'Buffer length not multiple of block size' ) )

    var self = this

    debug( 'write %s %s', offset, buffer.length )

    this.image.write( data, offset, function( error, bytesWritten, buffer ) {
      callback.call( self, error, bytesWritten, buffer )
    })

  },

  /**
   * Close the VHD image
   * @param {Function} callback( error )
   * @return {VHD.Dynamic}
   */
  close: function( callback ) {

    var self = this

    this.image.close( function( error ) {
      self.emit( 'close', error )
      callback.call( self, error )
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
    var offset = this.table.sectors[ sector ] * this.blockSize
    var length = this.bitmapBlocks * this.blockSize
    debug( 'read_sector_bitmap %s (%s)', sector, this.table.sectors[ sector ] )
    this.read( offset, length, callback )
  },

  readSectorBlocks: function( sector, fromBlock, toBlock, callback ) {

    fromBlock = fromBlock || 0
    toBlock = toBlock || 0

    if( toBlock >= this.blocksPerSector || fromBlock >= this.blocksPerSector ) {
      return callback.call( this, new Error( 'Blocks not in sector ' + sector ) )
    }

    debug( 'read_sector %s (%s -> %s)', sector, fromBlock, toBlock )

    var length = ( toBlock - fromBlock ) * this.blockSize
    var offset = ( this.table.sectors[ sector ] + this.bitmapBlocks + fromBlock ) * this.blockSize

    if( this.table.needsAllocation( sector ) ) {
      var buffer = new Buffer( length )
      buffer.fill(0)
      return callback.call( this, null, buffer, length )
    }

    this.read( offset, length, callback )

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
      this.readSectorBlocks( read.sector, read.start, read.end, ( error, bytes, bytesRead ) => {
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

// Inherit from Emitter
inherit( Dynamic, Emitter )

// Exports
module.exports = Dynamic
