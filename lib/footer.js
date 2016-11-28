var VHD = require( '../' )
var CRC32 = require( 'buffer-crc32' )
var CHS = require( 'chs' )

/**
 * Hard Disk Footer (HDF)
 * @constructor
 * @param {Object} data
 */
function Footer( data ) {

  if( !(this instanceof Footer) )
    return new Footer( data )

  this.cookie = 'node-vhd'
  this.features = VHD.FEATURES.NONE
  this.fileFormatVersion = new VHD.Version( '1.0' )
  this.dataOffset = 0xFFFFFFFF
  this.timeStamp = new Date( VHD.EPOCH )
  this.creatorApplication = 'nvhd'

  this.creatorVersion = new VHD.Version(
    require( '../package' ).version.substr( 0, 4 )
  )

  this.creatorHostOS = process.platform === 'win32' ?
    VHD.HOST_OS.WINDOWS :
    VHD.HOST_OS.MACINTOSH

  this.originalSize = 0
  this.currentSize = 0
  this.diskGeometry = new CHS()
  this.diskType = 0
  this.checksum = 0
  this.uniqueId = new Buffer( 16 )
  this.savedState = false

  // 427 bytes
  // this.reserved = 0

}

/**
 * Footer Prototype
 * @type {Object}
 * @ignore
 */
Footer.prototype = {

  constructor: Footer,

  parse: function( value ) {

    var buffer = ( value instanceof Buffer ) ?
      value : new Buffer( value )

    // 8 bytes
    this.cookie = buffer.toString( 'utf8', 0, 8 )
    // 4 bytes
    this.features = buffer.readUInt32BE( 8 )
    // 4 bytes
    this.fileFormatVersion.parse( buffer.slice( 12, 16 ) )
    // 8 bytes
    this.dataOffset = buffer.readUIntBE( 16, 8 )
    // 4 bytes
    this.timeStamp = new Date( VHD.EPOCH + buffer.readUInt32BE( 24 ) * 1000 )
    // 4 bytes
    this.creatorApplication = buffer.toString( 'utf8', 28, 32 )
    // 4 bytes
    this.creatorVersion.parse( buffer.slice( 32, 36 ) )
    // 4 bytes
    this.creatorHostOS =
      VHD.HOST_OS[ buffer.readUInt32BE( 36 ) ] ||
      buffer.readUInt32BE( 36 )
    // 8 bytes
    this.originalSize = buffer.readUIntBE( 40, 8 )
    // 8 bytes
    this.currentSize = buffer.readUIntBE( 48, 8 )
    // 4 bytes
    this.diskGeometry = new CHS(
      buffer.readUInt16BE( 56 ),
      buffer.readUInt8( 58 ),
      buffer.readUInt8( 59 )
    )
    // 4 bytes
    this.diskType = buffer.readUInt32BE( 60 )
    // 4 bytes
    this.checksum = buffer.readUInt32BE( 64 )
    // 16 bytes
    buffer.copy( this.uniqueId, 0, 68 )
    // 1 bytes
    this.savedState = !!buffer.readUInt8( 84 + 16 )
    // 427 bytes
    // this.reserved = 0

    return this

  },

  valueOf: function() {
    return new Buffer( 0 )
  },

}

// Exports
module.exports = Footer
