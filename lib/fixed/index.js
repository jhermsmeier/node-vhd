var VHD = require( '../vhd' )
var Emitter = require( 'async-emitter' )
var async = require( 'async' )
var File = require( 'fabl' )

/**
 * Fixed Disk Constructor
 * @param {Object} options
 */
function Fixed( options ) {
  
  if( !(this instanceof Fixed) )
    return new Fixed( options )
  
  Emitter.call( this )
  
  this.sectorSize = 512
  this.path = options.path
  
  this.image = new File( this.path )
  this.footer = new VHD.Footer()
  
}

// Exports
module.exports = Fixed

/**
 * Fixed Disk Prototype
 * @type {Object}
 */
Fixed.prototype = {
  
  constructor: Fixed,
  
  open: function( done ) {
    
    var self = this
    
    async.waterfall([
      function open( done ) {
        self.image.end = void 0
        self.image.open( 'r+', done )
      },
      function stat( fd, done ) {
        self.image.stat( done )
      },
      function readFooter( stat, done ) {
        self.image.read(
          stat.size - 512, 512,
          function( error, bytes, buffer ) {
            // Limit image reads / writes, so the footer
            // won't be overwritten or read from
            self.image.end = stat.size - 512
            done( error, bytes, buffer )
          }
        )
      },
      function parseFooter( bytes, buffer, done ) {
        var error = null
        try { self.footer.parse( buffer ) }
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
  
  read: function( offset, length, callback ) {
    var self = this
    return this.image.read(
      offset, length, function( error, bytes, buffer ) {
        callback.call( self, error, bytes, buffer )
      }
    )
  },
  
  write: function( data, offset, callback ) {
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
Fixed.prototype.__proto__ =
  Emitter.prototype
