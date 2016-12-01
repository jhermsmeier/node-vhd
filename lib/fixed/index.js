var VHD = require( '../vhd' )
var Emitter = require( 'events' ).EventEmitter
var inherit = require( 'bloodline' )
var series = require( 'fastseries' )()
var File = require( 'fabl' )

/**
 * Fixed Disk
 * @constructor
 * @param {String} path
 */
function Fixed( path ) {

  if( !(this instanceof Fixed) )
    return new Fixed( path )

  Emitter.call( this )

  /** @type {Number} Sector size */
  this.sectorSize = 512
  /** @type {String} Image file path */
  this.path = path

  this.image = new File( this.path )
  this.footer = new VHD.Footer()

}

/**
 * Fixed Disk Prototype
 * @type {Object}
 * @ignore
 */
Fixed.prototype = {

  constructor: Fixed,

  /**
   * Read & parse the VHD footer
   * @param {Function} callback( error, footer )
   * @return {VHD.Dynamic}
   */
  readFooter: function( callback ) {

    debug( 'read_footer %s, %s', offset, length )

    this.image.stat( ( error, stats ) => {

      if( error ) return callback.call( this, error )

      var offset = stats.size - 512
      var length = 512

      this.image.read( offset, length, ( error, bytesRead, buffer ) => {

        if( error ) return callback.call( this, error )
        if( bytesRead !== length ) {
          error = new Error( 'Bytes read mismatch: ' + bytesRead + ' != 512' )
          return callback.call( this, error )
        }

        try { this.footer.parse( buffer ) }
        catch( e ) { return callback.call( this, e ) }

        // Limit image reads / writes, so the footer
        // won't be overwritten or read from
        this.image.end = offset

        callback.call( this, null, this.footer )

      })

    })

    return this

  },

  open: function( callback ) {

    debug( 'open' )

    series( this, [
      function open( done ) {
        this.image.end = void 0
        this.image.open( 'r+', done )
      },
      this.readFooter,
    ], null, function( error ) {
      debug( 'open', error )
      this.emit( 'open' )
      callback.call( this, error )
    })

    return this

  },

  read: function( offset, length, callback ) {
    var self = this
    return this.image.read( offset, length, function( error, bytes, buffer ) {
      callback.call( self, error, bytes, buffer )
    })
  },

  write: function( data, offset, callback ) {
    var self = this
    return this.image.read( data, offset, function( error, bytes, buffer ) {
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

}

// Inherit from Emitter
inherit( Fixed, Emitter )

// Exports
module.exports = Fixed
