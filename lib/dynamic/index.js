var VHD = require( '../vhd' )
var Emitter = require( 'events' ).EventEmitter
var inherit = require( 'bloodline' )
var series = require( 'fastseries' )()
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

  /**
   * Calculate a sector's offset in bytes from a LBA
   * @param {Number} lba
   * @return {Number} offset
   */
  sectorOffset: function( lba ) {
    return Math.floor( lba / this.blocksPerSector )
  },

  /**
   * Calculate a block's address within it's sector
   * @param {Number} lba
   * @return {Number} sba
   */
  blockInSector: function( lba ) {
    return ( lba % this.blocksPerSector ) + this.bitmapBlocks
  },

  /**
   * Calculate a block's offset in bytes from a LBA
   * @param {Number} lba
   * @return {Number} offset
   */
  blockOffset: function( lba ) {

    var sector = this.sectorOffset( lba )

    if( this.table.sectors[ sector ] === 0xFFFFFFFF )
      return -1

    var block = lba % this.blocksPerSector
    var location = this.table.sectors[ sector ] +
      this.bitmapBlocks + block

    var offset = location * this.blockSize

    return this.table.sectors[ sector ]

  },

  /**
   * Read & parse the VHD header
   * @param {Function} callback( error, header )
   * @return {VHD.Dynamic}
   */
  readHeader: function( callback ) {

    // TODO: Store header offset & length in static var (?)
    var offset = 512
    var length = 1024

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

    if( buffer.length % this.blockSize !== 0 )
      return callback.call( this, new Error( 'Buffer length not multiple of block size' ) )

    var self = this

    this.image.read( offset, length, function( error, bytesRead, buffer ) {
      callback.call( self, error, buffer, bytesRead )
    })

  },

  write: function( buffer, offset, callback ) {

    if( buffer.length % this.blockSize !== 0 )
      return callback.call( this, new Error( 'Buffer length not multiple of block size' ) )

    var self = this

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

  /**
   * Read a sector's block bitmap
   * NOTE: buffer will be null if sector is not allocated
   * @param {Number} sector
   * @param {Function} callback(error, buffer)
   */
  readSectorBitmap: function( sector, callback ) {

    if( this.table.needsAllocation( sector ) )
      return callback.call( this, null, null )

    var self = this
    var offset = this.table.sectors[ sector ]
    var length = this.blockSize * this.bitmapBlocks

    debug( 'read_sector_bitmap %s %s', offset, length )

    if( offset == null )
      return callback.call( this, new Error( 'Invalid sector number: ' + sector ) )

    this.image.read( offset, length, function( error, bytesRead, buffer ) {
      callback.call( self, error, buffer )
    })

    return this

  },

  /**
   * Read a sector from a given block to another given block
   * @param {Number} sector
   * @param {Number} fromBlock
   * @param {Number} toBlock
   * @param {Function} callback(error, buffer, bytesRead)
   */
  readSector: function( sector, fromBlock, toBlock, callback ) {

    fromBlock = fromBlock || 0
    toBlock = toBlock || this.blocksPerSector

    if( toBlock > this.blocksPerSector || fromBlock > this.blocksPerSector ) {
      return callback.call( this, new Error( 'Blocks not in sector ' + sector ) )
    }

    debug( 'read_sector %s %s %s', sector, fromBlock, toBlock )

    var length = ( toBlock - fromBlock ) * this.blockSize
    var offset = ( this.table.sectors[ sector ] + fromBlock ) * this.blockSize

    // If this sector would need allocation, it's empty
    if( this.table.needsAllocation( sector ) ) {
      var buffer = new Buffer( length )
      buffer.fill(0)
      return callback.call( this, null, buffer )
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

    var self = this

    if( typeof buffer === 'function' ) {
      callback = buffer
      buffer = null
    }

    var blocksPerSector = this.sectorSize / this.blockSize
    var bitmapBlocks = Math.ceil( blocksPerSector / 8 / this.blockSize )
    // var dataOffset = 512 + 1024 + ( this.header.maxTableEntries * 4 )
    var fromSector = Math.floor( fromLBA / blocksPerSector )
    var toSector = Math.floor( toLBA / blocksPerSector )

    // TODO: Impl cross-sector reads by iterating over sectors,
    // as each sector can be in a different location, and a
    // continuous read across them cannot be guaranteed
    if( fromSector !== toSector ) {
      setImmediate( function() { callback( new Error( 'Cross-sector read not yet supported' ) ) })
      return this
    }

    var fromBlock = fromLBA % blocksPerSector
    var toBlock = toLBA % blocksPerSector

    var actualLocation = this.table.sectors[ fromSector ] +
      bitmapBlocks + fromBlock

    var offset = actualLocation * this.blockSize
    var length = ( toBlock - fromBlock ) * this.blockSize

    this.image.read( offset, length, function( error, bytesRead, buffer ) {
      callback.call( self, error, buffer, bytesRead )
    })

    return this

  },

  /**
   * Writes data starting at a given LBA
   * @param {Number} fromLBA
   * @param {Buffer} buffer
   * @param {Function} callback( error, buffer, bytesWritten )
   * @return {VHD.Dynamic}
   */
  writeBlocks: function( fromLBA, buffer, callback ) {
    setImmediate( function() { callback( new Error( 'Not implemented' ) ) })
    return this
  },

}

// Inherit from Emitter
inherit( Dynamic, Emitter )

// Exports
module.exports = Dynamic
