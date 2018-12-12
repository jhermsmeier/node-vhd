var VHD = require( './vhd' )
var int64 = require( './int64' )

/**
 * VHD Footer
 * @memberOf VHD
 * @class
 * @description
 * | Hard disk footer fields     | Size (bytes)     | Offset (bytes)   |
 * |-----------------------------|------------------|------------------|
 * | Cookie                      | 8                | 0                |
 * | Features                    | 4                | 8                |
 * | File Format Version         | 4                | 12               |
 * | Data Offset                 | 8                | 16               |
 * | Time Stamp                  | 4                | 24               |
 * | Creator Application         | 4                | 28               |
 * | Creator Version             | 4                | 32               |
 * | Creator Host OS             | 4                | 36               |
 * | Original Size               | 8                | 40               |
 * | Current Size                | 8                | 48               |
 * | Disk Geometry               | 4                | 56               |
 * | Disk Type                   | 4                | 60               |
 * | Checksum                    | 4                | 64               |
 * | Unique Id                   | 16               | 68               |
 * | Saved State                 | 1                | 84               |
 * | Reserved                    | 427              | 85               |
 */
class Footer {

  /**
   * Create a VHD Footer
   * @returns {VHD.Footer}
   */
  constructor() {

    /** @type {String} Cookie, used to uniquely identify the original creator application */
    this.cookie = 'node-vhd'
    /** @type {Number} Feature flags, reserved bit must always be set */
    this.features = VHD.FEATURES.NONE & VHD.FEATURES.RESERVED
    /** @type {VHD.Version} File format version */
    this.fileFormatVersion = new VHD.Version( '1.0' )
    /** @type {Number} Data offset */
    this.dataOffset = 0xFFFFFFFFFFFFFFFF
    /** @type {Date} Timestamp */
    this.timestamp = new Date()
    /** @type {String} Creator application */
    this.creatorApplication = 'node'
    /** @type {VHD.Version} Creator version */
    this.creatorVersion = new VHD.Version( process.versions.node ) // PACKAGE_VERSION
    /** @type {VHD.HOST_OS} Creator host OS */
    this.creatorHostOS = process.platform === 'win32' ?
      VHD.HOST_OS.WINDOWS : VHD.HOST_OS.MACINTOSH
    /** @type {Number} Original Size */
    this.originalSize = 0
    /** @type {Number} Current Size */
    this.currentSize =  0
    /** @type {CHS} Disk geometry */
    this.diskGeometry = {
      cylinders: 0,
      heads: 0,
      sectors: 0,
    }
    /** @type {VHD.TYPE} Disk type */
    this.diskType = 0
    /** @type {Number} Checksum */
    this.checksum = 0
    /** @type {Buffer} Unique ID */
    this.uniqueId = Buffer.alloc( 16 )
    /** @type {Number} Saved state */
    this.savedState = 0
    /** @type {Buffer} Reserved */
    this.reserved = Buffer.alloc( 427 )

  }

  /**
   * Parse the footer from a buffer
   * @param {Buffer} buffer
   * @param {Object} [offset=0]
   * @returns {Buffer}
   */
  parse( buffer, offset ) {

    offset = offset || 0

    // NOTE: Due to some Windows versions creating VHDs
    // that have a footer that's one byte short, we need
    // to check if this is the case here, and advance the
    // offset by that one byte for it to parse correctly
    // TODO: Check that `buffer[0]` can be relied upon
    // to be zero in all cases
    if( this.isShort = ( buffer[0] === 0x00 ) ) {
      offset += 1
    }

    let toString = ( buffer, encoding, start, end ) => {
      var eod = Math.min( Math.max( start, buffer.indexOf( 0x00, start ) ), end )
      return buffer.toString( encoding, start, eod )
    }

    var signature = toString( buffer, 'ascii', offset + 0, offset + 8 )

    if( signature !== Footer.SIGNATURE ) {
      throw new Error( `Invalid header signature "${signature}"; expected "${Header.SIGNATURE}"` )
    }

    this.cookie = signature
    this.features = buffer.readUInt32BE( offset + 8 )
    this.fileFormatVersion.parse( buffer, offset + 12 )
    this.dataOffset = int64.readUIntBE( buffer, offset + 16 )
    this.timestamp.setTime( VHD.EPOCH + ( buffer.readUInt32BE( offset + 24 ) * 1000 ) )
    this.creatorApplication = toString( buffer, 'ascii', offset + 28, offset + 32 )
    this.creatorVersion.parse( buffer, offset + 32 )
    this.creatorHostOS = buffer.readUInt32BE( offset + 36 )
    this.originalSize = int64.readUIntBE( buffer, offset + 40 )
    this.currentSize = int64.readUIntBE( buffer, offset + 48 )

    this.diskGeometry.cylinders = buffer.readUInt16BE( offset + 56 )
    this.diskGeometry.heads = buffer[ offset + 58 ]
    this.diskGeometry.sectors = buffer[ offset + 59 ]

    this.diskType = buffer.readUInt32BE( offset + 60 )
    this.checksum = buffer.readUInt32BE( offset + 64 )

    buffer.copy( this.uniqueId, 0, offset + 68, offset + 84 )

    this.savedState = buffer.readUInt8( offset + 84 )

    buffer.copy( this.reserved, 0, offset + 85, offset + 512 )

    return this

  }

  /**
   * Write the footer to a buffer
   * @param {Buffer} [buffer]
   * @param {Object} [offset=0]
   * @returns {Buffer}
   */
  write( buffer, offset ) {

    offset = offset || 0
    buffer = buffer || Buffer.alloc( Footer.SIZE + offset )

    if( this.isShort ) {
      offset += 1
    }

    buffer.write( this.cookie, offset + 0, 8, 'ascii' )
    buffer.writeUInt32BE( this.features, offset + 8 )

    this.fileFormatVersion.write( buffer, offset + 12 )

    // The "null" value here is too large for JS to
    // handle as one number, hence we write 2 x uint32
    if( this.dataOffset === 0xFFFFFFFFFFFFFFFF ) {
      buffer.writeUInt32BE( 0xFFFFFFFF, offset + 16 )
      buffer.writeUInt32BE( 0xFFFFFFFF, offset + 20 )
    } else {
      int64.writeUIntBE( buffer, this.dataOffset, offset + 16 )
    }

    buffer.writeUInt32BE( ( this.timestamp.getTime() - VHD.EPOCH ) / 1000, offset + 24 )
    buffer.write( this.creatorApplication, offset + 28, 4, 'ascii' )

    this.creatorVersion.write( buffer, offset + 32 )

    buffer.writeUInt32BE( this.creatorHostOS, offset + 36 )
    int64.writeUIntBE( buffer, this.originalSize, offset + 40 )
    int64.writeUIntBE( buffer, this.currentSize, offset + 48 )

    buffer.writeUInt16BE( this.diskGeometry.cylinders, offset + 56 )
    buffer[ offset + 58 ] = this.diskGeometry.heads
    buffer[ offset + 59 ] = this.diskGeometry.sectors

    buffer.writeUInt32BE( this.diskType, offset + 60 )
    buffer.writeUInt32BE( this.checksum, offset + 64 )

    this.uniqueId.copy( buffer, offset + 68 )

    buffer.writeUInt8( this.savedState, offset + 84 )

    this.reserved.copy( buffer, offset + 85 )

    return buffer

  }

}

/**
 * VHD Footer structure size in bytes
 * @type {Number}
 * @constant
 */
Footer.SIZE = 512

/**
 * VHD Footer signature
 * @type {String}
 * @constant
 */
Footer.SIGNATURE = 'conectix'

/**
 * Parse a VHD Footer from a buffer
 * @param {Buffer} buffer
 * @param {Object} [offset=0]
 * @returns {VHD.Footer}
 */
Footer.parse = function( buffer, offset ) {
  return new Footer().parse( buffer, offset )
}

module.exports = Footer
