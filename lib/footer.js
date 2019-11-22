var VHD = require( './vhd' )
var { readBigUInt64BE, writeBigUInt64BE } = require( './buffer' )

function readString( buffer, encoding, start, end ) {
  var eod = Math.min( Math.max( start, buffer.indexOf( 0x00, start ) ), end )
  return buffer.toString( encoding, start, eod )
}

class Footer {

  /**
   * Creates a VHD Footer structure
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
   * @returns {VHD.Footer}
   */
  constructor() {

    /** @type {String} Cookie, used to uniquely identify the original creator application */
    this.signature = Footer.SIGNATURE
    /** @type {Number} Feature flags, reserved bit must always be set */
    this.features = VHD.FEATURES.NONE | VHD.FEATURES.RESERVED
    /** @type {Object} File format version */
    this.formatVersion = { major: 1, minor: 0 }
    /** @type {BigInt} Absolute byte offset to the next structure */
    this.dataOffset = 0xFFFFFFFFFFFFFFFFn
    /** @type {Number} Timestamp */
    this.timestamp = VHD.EPOCH
    /** @type {String} Creator application */
    this.creatorApplication = VHD.CREATOR_APPLICATION
    /** @type {String} Creator application version */
    this.creatorVersion = VHD.CREATOR_VERSION
    /** @type {String} Creator application host OS */
    this.creatorHostOS = process.platform === 'win32' ?
      VHD.PLATFORM.WI2K : VHD.PLATFORM.MAC
    /** @type {Number} Size of the hard disk, in bytes, at creation time */
    this.originalSize = 0x0000000000000000n
    /** @type {Number} Current size of the hard disk, in bytes */
    this.currentSize = 0x0000000000000000n
    /** @type {Object} Disk geometry (CHS) */
    this.diskGeometry = {
      cylinders: 0,
      heads: 0,
      sectors: 0,
    }
    /** @type {VHD.TYPE} Disk type (enum) */
    this.diskType = VHD.TYPE.NONE
    /** @type {Number} Checksum */
    this.checksum = 0x00000000
    /** @type {Buffer} UUID of this VHD */
    this.uuid = Buffer.alloc( 16 )
    /** @type {Number} Saved state */
    this.savedState = 0
    /** @type {Buffer} Reserved */
    this.reserved = Buffer.alloc( 427 )

  }

  static parse( buffer, offset ) {
    return new Footer().parse( buffer, offset )
  }

  parse( buffer, offset ) {

    offset = offset || 0

    // NOTE: Due to some Windows versions creating VHDs
    // that have a footer that's one byte short, we need
    // to check if this is the case here, and advance the
    // offset by that one byte for it to parse correctly
    // TODO: Check that `buffer[0]` can be relied upon
    // to be zero in all cases
    if( buffer[0] === 0x00 ) {
      offset += 1
    }

    this.signature = buffer.toString( 'ascii', offset + 0, offset + 8 )

    if( this.signature !== Footer.SIGNATURE ) {
      throw new Error( `Invalid footer signature "${this.signature}"; expected "${Footer.SIGNATURE}"` )
    }

    this.features = buffer.readUInt32BE( offset + 8 )
    this.formatVersion.major = buffer.readUInt16BE( offset + 12 )
    this.formatVersion.minor = buffer.readUInt16BE( offset + 14 )
    this.dataOffset = readBigUInt64BE( buffer, offset + 16 )
    this.timestamp = ( buffer.readUInt32BE( offset + 24 ) * 1000 ) + VHD.EPOCH

    this.creatorApplication = readString( buffer, 'ascii', offset + 28, offset + 32 )
    this.creatorVersion.major = buffer.readUInt16BE( offset + 32 )
    this.creatorVersion.minor = buffer.readUInt16BE( offset + 34 )
    this.creatorHostOS = buffer.readUInt32BE( offset + 36 )

    this.originalSize = readBigUInt64BE( buffer, offset + 40 )
    this.currentSize = readBigUInt64BE( buffer, offset + 48 )

    this.diskGeometry.cylinders = buffer.readUInt16BE( offset + 56 )
    this.diskGeometry.heads = buffer.readUInt8( offset + 58 )
    this.diskGeometry.sectors = buffer.readUInt8( offset + 59 )

    this.diskType = buffer.readUInt32BE( offset + 60 )
    this.checksum = buffer.readUInt32BE( offset + 64 )

    buffer.copy( this.uuid, 0, offset + 68, offset + 84 )

    this.savedState = buffer.readUInt8( offset + 84 )

    buffer.copy( this.reserved, 0, offset + 85, offset + 512 )

    return this

  }

  write( buffer, offset ) {

    offset = offset || 0
    buffer = buffer || Buffer.alloc( Footer.SIZE + offset )

    buffer.write( this.signature, offset, 8, 'ascii' )
    offset += 8

    offset = buffer.writeUInt32BE( this.features, offset )
    offset = buffer.writeUInt16BE( this.formatVersion.major, offset )
    offset = buffer.writeUInt16BE( this.formatVersion.minor, offset )
    offset = writeBigUInt64BE( buffer, this.dataOffset, offset )
    offset = buffer.writeUInt32BE( ( this.timestamp - VHD.EPOCH ) / 1000, offset )

    buffer.fill( 0x20, offset, offset + 4 )
    buffer.write( this.creatorApplication, offset, 4, 'ascii' )
    offset += 4

    offset = buffer.writeUInt16BE( this.creatorVersion.major, offset )
    offset = buffer.writeUInt16BE( this.creatorVersion.minor, offset )
    offset = buffer.writeUInt32BE( this.creatorHostOS, offset )

    offset = writeBigUInt64BE( buffer, this.originalSize, offset )
    offset = writeBigUInt64BE( buffer, this.currentSize, offset )

    offset = buffer.writeUInt16BE( this.diskGeometry.cylinders, offset )
    offset = buffer.writeUInt8( this.diskGeometry.heads, offset )
    offset = buffer.writeUInt8( this.diskGeometry.sectors, offset )

    offset = buffer.writeUInt32BE( this.diskType, offset )

    // Keep checksum clear for calculation
    offset = buffer.writeUInt32BE( 0x00000000, offset )

    offset += this.uuid.copy( buffer, offset, 0, 16 )
    offset = buffer.writeUInt8( this.savedState, offset )
    offset += this.reserved.copy( buffer, offset, 0, 427 )

    // Calculate & write checksum
    var checksum = VHD.checksum( buffer, offset - Footer.SIZE, offset )
    var checksumOffset = offset - Footer.SIZE + Footer.CHECKSUM_OFFSET

    buffer.writeUInt32BE( checksum, checksumOffset )

    return buffer

  }

}

/**
 * Size of the VHD Footer structure in bytes
 * @type {Number}
 * @constant
 * @default
 */
Footer.SIZE = 512

/**
 * Relative offset of the footer checksum
 * @type {Number}
 * @constant
 * @default
 */
Footer.CHECKSUM_OFFSET = 64

/**
 * VHD Footer signature
 * @type {String}
 * @constant
 * @default
 */
Footer.SIGNATURE = 'conectix'

module.exports = Footer
