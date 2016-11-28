var VHD = require( '../vhd' )
var Emitter = require( 'events' ).EventEmitter
var inherit = require( 'bloodline' )
var async = require( 'async' )
var File = require( 'fabl' )

/**
 * Dynamic Disk
 * @constructor
 * @param {Object} options
 */
function Dynamic( options ) {

  if( !(this instanceof Dynamic) )
    return new Dynamic( options )

  Emitter.call( this )

  // Default sector size is 2 MB, a sector
  // containing 4096 512 byte blocks
  this.sectorSize = 512 * 4096
  this.blockSize = 512
  this.size = -1

  this.path = options.path

  this.image = new File( this.path )
  this.header = new Dynamic.Header()
  this.footer = new VHD.Footer()
  this.table = new Dynamic.AllocationTable()

  Object.defineProperty( this, 'image', {
    enumerable: false
  })

}

// Dynamic Disk Header Format (DDHF)
Dynamic.Header = require( '../header' )
// Block Allocation Table
Dynamic.AllocationTable = require( '../alloc-table' )

/**
 * Dynamic Disk Prototype
 * @type {Object}
 * @ignore
 */
Dynamic.prototype = {

  constructor: Dynamic,

  open: function( done ) {

    var self = this

    async.waterfall([
      function open( done ) {
        self.image.end = void 0
        self.image.open( 'r+', done )
      },
      function readFooter( fd, done ) {
        self.image.read( 0, 512, done )
      },
      function parseFooter( bytes, buffer, done ) {
        var error = null
        try { self.footer.parse( buffer ) }
        catch( e ) { error = e }
        done( error )
      },
      function readHeader( done ) {
        self.image.read( 512, 1024, done )
      },
      function parseHeader( bytes, buffer, done ) {
        var error = null
        try { self.header.parse( buffer ) }
        catch( e ) { error = e }
        done( error )
      },
      function readBAT( done ) {
        self.image.read(
          self.header.tableOffset,
          self.header.maxTableEntries * 4,
          done
        )
      },
      function parseBAT( bytes, buffer, done ) {
        var error = null
        try { self.table.parse( buffer ) }
        catch( e ) { error = e }
        done( error )
      }
    ], function( error, result ) {
      if( error != null ) {
        self.emit( 'error', error )
      } else {
        self.sectorSize = self.header.sectorSize
        self.size = self.header.maxTableEntries * self.header.sectorSize
        self.emit( 'open' )
        done.call( self )
      }
    })

    return this

  },

  read: function( offset, length, callback ) {

    return void 0
    var self = this
    return this.image.read( offset, length, function( error, bytes, buffer ) {
      callback.call( self, error, bytes, buffer )
    })

  },

  write: function( buffer, offset, callback ) {

    if( buffer.length % this.blockSize !== 0 )
      return callback( new Error( 'Buffer length not multiple of block size' ) )

    // TODO:
    // Calculate block to write to;
    // If block needs creation, allocate, then move Footer to EOF
    // Write to block, then mark block as dirty
    return void 0
    var self = this
    return this.image.write( data, offset, function( error, bytes, buffer ) {
      callback.call( self, error, bytes, buffer )
    })

  },

  close: function( done ) {

    var self = this

    this.image.close( function( error ) {
      self.emit( 'close', error )
      done.call( self, error )
    })

    return this

  },


  /**
   * Reads from one LBA to another
   * @param {Number} fromLBA
   * @param {Number} toLBA
   * @param {Buffer} buffer (optional)
   * @param {Function} callback( error, buffer, bytesRead )
   * @return {BlockDevice}
   */
  readBlocks: function( fromLBA, toLBA, buffer, callback ) {

    var self = this

    if( typeof buffer === 'function' ) {
      callback = buffer
      buffer = null
    }

    var blocksPerSector = this.sectorSize / this.blockSize
    var bitmapBlockCount = Math.ceil( blocksPerSector / 8 / this.blockSize )
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
      bitmapBlockCount + fromBlock

    var offset = actualLocation * this.blockSize
    var length = ( toBlock - fromBlock ) * this.blockSize

    this.image.read( offset, length, function( error, bytesRead, buffer ) {
      callback.call( self, error, buffer, bytesRead )
    })

    return this

  },

  writeBlocks: function( fromLBA, buffer, callback ) {
    setImmediate( function() { callback( new Error( 'Not implemented' ) ) })
    return this
  },

}

// Inherit from Emitter
inherit( Dynamic, Emitter )

// Exports
module.exports = Dynamic
