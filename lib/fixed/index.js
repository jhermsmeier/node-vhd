var VHD = require( '../vhd' )
var debug = require( 'debug' )( 'vhd:fixed' )

/**
 * Fixed Disk
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
function Fixed( path, options ) {

  if( !(this instanceof Fixed) )
    return new Fixed( path, options )

  if( typeof path !== 'string' ) {
    options = path
    path = null
  }

  /** @type {Number} Block size */
  this.blockSize = options && options.blockSize ?
    options.blockSize : VHD.BLOCK_SIZE

  /** @type {String} Image file descriptor */
  this.fd = options && options.fd ?
    options.fd : null
  /** @type {String} Image file path */
  this.path = options && options.path ?
    options.path : path
  /** @type {String} File open() flags */
  this.flags = options && options.flags ?
    options.flags : 'r'
  /** @type {String} File open() mode */
  this.mode = options && options.mode ?
    options.mode : null
  /** @type {Object} Filesystem API */
  this.fs = options && options.fs ?
    options.fs : require( 'fs' )

  Object.defineProperty( this, 'fs', {
    enumerable: false
  })

  this.footer = new VHD.Footer()

}

Fixed.ReadStream = require( './read-stream' )

Fixed.createReadStream = function( image, options ) {
  return new Fixed.ReadStream( image, options )
}

/**
 * Fixed Disk Prototype
 * @type {Object}
 * @ignore
 */
Fixed.prototype = {

  constructor: Fixed,

  createReadStream( options ) {
    options = options || {}
    options.autoClose = false
    return new Fixed.ReadStream( this, options )
  },

  /**
   * Read & parse the VHD footer
   * @param {Function} callback( error, footer )
   * @return {VHD.Dynamic}
   */
  readFooter: function( callback ) {

    this.fs.fstat( this.fd, ( error, stats ) => {

      if( error ) {
        return callback.call( this, error )
      }

      var offset = stats.size - VHD.Footer.SIZE

      debug( 'read_footer %s, %s', offset, VHD.Footer.SIZE )

      this.read( offset, VHD.Footer.SIZE, ( error, bytesRead, buffer ) => {

        if( error ) return callback.call( this, error )
        if( bytesRead !== VHD.Footer.SIZE ) {
          error = new Error( 'Bytes read mismatch: ' + bytesRead + ' != 512' )
          return callback.call( this, error )
        }

        try {
          this.footer.parse( buffer )
        } catch( e ) {
          return callback.call( this, e )
        }

        callback.call( this, null, this.footer )

      })

    })

    return this

  },

  open: function( callback ) {

    debug( 'open' )

    this.fs.open( this.path, this.flags, this.mode, ( error, fd ) => {

      this.fd = fd

      if( error ) {
        return callback.call( this, error )
      }

      this.readFooter( ( error ) => {
        callback.call( this, error )
      })

    })

    return this

  },

  read: function( position, length, callback ) {
    debug( 'read(%s,%s)', position, length )
    var buffer = Buffer.alloc( length )
    return this.fs.read( this.fd, buffer, 0, length, position, ( error, bytesRead, buffer ) => {
      callback.call( this, error, bytesRead, buffer )
    })
  },

  write: function( buffer, position, callback ) {
    debug( 'write(%s,%s)', buffer.length, position )
    return this.fs.write( this.fd, buffer, 0, buffer.length, position, ( error, bytesWritten, buffer ) => {
      callback.call( this, error, bytesWritten, buffer )
    })
  },

  /**
   * Reads from one LBA to another
   * @param {Number} fromLBA
   * @param {Number} toLBA
   * @param {Buffer} [buffer]
   * @param {Function} callback( error, buffer, bytesRead )
   * @return {Fixed}
   */
  readBlocks: function( fromLBA, toLBA, buffer, callback ) {

    if( typeof buffer === 'function' ) {
      callback = buffer
      buffer = null
    }

    var self = this
    var offset = fromLBA * this.blockSize
    var length = ( toLBA - fromLBA ) * this.blockSize

    debug( 'readBlocks(%s,%s)', fromLBA, toLBA )

    this.read( offset, length, function( error, bytesRead, buffer ) {
      callback.call( self, error, buffer, bytesRead )
    })

    return this

  },

  /**
   * Writes data starting at a given LBA
   * @param {Number} fromLBA
   * @param {Buffer} buffer
   * @param {Function} callback( error, buffer, bytesWritten )
   * @return {Fixed}
   */
  writeBlocks: function( fromLBA, buffer, callback ) {
    debug( 'writeBlocks(%s,%s)', fromLBA, buffer.length / this.blockSize )
    setImmediate( function() { callback( new Error( 'Not implemented' ) ) } )
    return this
  },

  close: function( done ) {

    this.fs.close( this.fd, ( error ) => {
      done.call( this, error )
    })

    return this

  },

}

// Exports
module.exports = Fixed
