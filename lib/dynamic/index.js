var VHD = require( '../vhd' )
var Emitter = require( 'async-emitter' )
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

  this.sectorSize = 512
  this.path = options.path

  this.image = new File( this.path )
  this.header = new Dynamic.Header()
  this.footer = new VHD.Footer()
  this.blocks = new Dynamic.AllocationTable()

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
        try { self.blocks.parse( buffer ) }
        catch( e ) { error = e }
        done( error )
      }
    ], function( error, result ) {
      if( error != null ) {
        self.emit( 'error', error )
      } else {
        self.emit( 'open' )
        done.call( self )
      }
    })

    return this

  },

  read: function( offset, length, done ) {
    // TODO:
    // Calculate block to write to;
    // If block needs creation, allocate, then move Footer to EOF
    // Write to block, then mark block as dirty
    return void 0
    var self = this
    return this.image.read(
      offset, length, function( error, bytes, buffer ) {
        callback.call( self, error, bytes, buffer )
      }
    )
  },

  write: function( data, offset, done ) {
    // TODO:
    // Calculate block to write to;
    // If block needs creation, allocate, then move Footer to EOF
    // Write to block, then mark block as dirty
    return void 0
    var self = this
    return this.image.read(
      data, offset, function( error, bytes, buffer ) {
        callback.call( self, error, bytes, buffer )
      }
    )
  },

  close: function( done ) {

    var self = this

    this.image.close( function( error ) {
      self.emit( 'close', error )
      done.call( self, error )
    })

    return this

  },

}

// Inherit from Emitter
Dynamic.prototype.__proto__ =
  Emitter.prototype

// Exports
module.exports = Dynamic
