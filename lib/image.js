/**
 * VHD Image
 * @description Abstract base class
 * @constructor
 * @memberOf VHD
 * @param {Object} [options]
 * @returns {Image}
 */
function Image( options ) {

  if( this.constructor === Image ) {
    throw new Error( 'Illegal constructor' )
  }

  this.header = null
  this.footer = null
  this.path = null
  this.fd = null
  this.flags = 'r'
  this.mode = 0o666

  this.blockSize = 512

}

/**
 * Image prototype
 * @type {Object}
 * @ignore
 */
Image.prototype = {

  constructor: Image,

  open( filename, callback ) {
    callback.call( this, new Error( 'Not implemented' ) )
  },

  _read( buffer, position, callback ) {
    fs.read( this.fd, buffer, 0, buffer.length, position, ( error, bytesRead ) => {
      callback.call( this, error, bytesRead, buffer )
    })
  },

  _write( buffer, position, callback ) {
    fs.write( this.fd, buffer, 0, buffer.length, position, ( error, bytesWritten ) => {
      callback.call( this, error, bytesWritten, buffer )
    })
  },

  close( callback ) {
    callback.call( this, new Error( 'Not implemented' ) )
  },

}

module.exports = Image
