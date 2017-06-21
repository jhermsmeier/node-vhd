var crypto = require( 'crypto' )
var info = require( '../package.json' )
var VHD = require( './vhd' )
var CHS = require( 'chs' )

/**
 * Footer
 * @constructor
 * @memberOf VHD
 * @returns {Footer}
 */
function Footer() {

  if( !(this instanceof Footer) ) {
    return new Footer()
  }

  this.cookie = 'node-vhd'
  this.features = VHD.FEATURES.NONE
  this.fileFormatVersion = new VHD.Version( '1.0' )
  this.dataOffset = 0xFFFFFFFF
  this.timeStamp = new Date()
  this.creatorApplication = 'node'
  this.creatorVersion = new VHD.Version( info.version.substring( 0, 4 ) )
  this.creatorHostOS =  process.platform === 'win32' ?
    VHD.HOST_OS.WINDOWS : VHD.HOST_OS.MACINTOSH
  this.originalSize = 0
  this.currentSize =  0
  this.diskGeometry = new CHS()
  this.diskType = 0
  this.checksum = 0
  this.uniqueId = Buffer.alloc( 16 )
  this.savedState = crypto.randomBytes( 16 )
  this.reserved = Buffer.alloc( 427 )

}

/**
 * Parse a VHD Footer from a buffer
 * @param {Buffer} buffer
 * @param {Object} [offset=0]
 * @returns {Footer}
 */
Footer.parse = function( buffer, offset ) {
  return new Footer().parse( buffer, offset )
}

/**
 * Footer prototype
 * @type {Object}
 * @ignore
 */
Footer.prototype = {

  constructor: Footer,

  /**
   * Parse a VHD Footer from a buffer
   * @param {Buffer} buffer
   * @param {Object} [offset=0]
   * @returns {Footer}
   */
  parse( buffer, offset ) {

    offset = offset || 0

    this.cookie = buffer.toString( 'utf8', offset + 0, offset + 8 )
    this.features = buffer.readUInt32BE( offset + 8 )
    this.fileFormatVersion.parse( buffer, offset + 12 )
    this.dataOffset = buffer.readUIntBE( offset + 16, 8 )
    this.timeStamp.setTime( VHD.EPOCH + ( buffer.readUInt32BE( offset + 24 ) * 1000 ) )
    this.creatorApplication = buffer.toString( 'utf8', offset + 28, offset + 32 )
    this.creatorVersion.parse( buffer, offset + 32 )
    this.creatorHostOS = buffer.readUInt32BE( offset + 36 )
    this.originalSize = buffer.readUIntBE( offset + 40, 8 )
    this.currentSize = buffer.readUIntBE( offset + 48, 8 )
    this.diskGeometry = CHS.fromBuffer( buffer, offset + 56 )
    this.diskType = buffer.readUInt32BE( offset + 60 )
    this.checksum = buffer.readUInt32BE( offset + 64 )

    buffer.copy( this.uniqueId, 0, offset + 68 )

    // NOTE: Where does this come from?
    // And why is this in the reserved region?
    this.savedState = buffer.readUInt8( offset + 100 )

    buffer.copy( this.reserved, 0, offset + 84 )

    return this

  },

  /**
   * Write the Footer to a given buffer
   * @param {Buffer} buffer
   * @param {Number} [offset=0]
   * @returns {Buffer}
   */
  write( buffer, offset ) {

    offset = offset || 0

    buffer.write( this.cookie, offset + 0, 8, 'utf8' )
    buffer.writeUInt32BE( this.features, offset + 8 )
    this.fileFormatVersion.write( buffer, offset + 12 )
    buffer.writeUIntBE( this.dataOffset, offset + 16, 8 )
    buffer.writeUInt32BE( ( this.timeStamp.getTime() - VHD.EPOCH ) / 1000, offset + 24 )
    buffer.write( this.creatorApplication, offset + 28, 4, 'utf8' )
    this.creatorVersion.write( buffer, offset + 32 )
    buffer.writeUInt32BE( this.creatorHostOS, offset + 36 )
    buffer.writeUIntBE( this.originalSize, offset + 40, 8 )
    buffer.writeUIntBE( this.currentSize, offset + 48, 8 )
    this.diskGeometry.write( buffer, offset + 56 )
    buffer.writeUInt32BE( this.diskType, offset + 60 )
    buffer.writeUInt32BE( this.checksum, offset + 64 )

    this.uniqueId.copy( buffer, offset + 68 )

    // NOTE: Don't write this out, as we have no clue
    // how this got here, and why it would be at that offset
    // this.savedState = buffer.readUInt8( offset + 100 )

    this.reserved.copy( buffer, offset + 84 )

    return buffer

  },

  /**
   * Create a buffer from the Footer
   * @returns {Buffer}
   */
  toBuffer() {
    var buffer = Buffer.alloc( VHD.FOOTER_SIZE )
    return this.write( buffer )
  },

}

module.exports = Footer
