var VHD = require( './vhd' )
var int64 = require( './int64' )

/**
 * VHD Header
 * @memberOf VHD
 * @class
 * @description
 * | Dynamic Disk Header fields     | Size (bytes)     | Offset (bytes)   |
 * |--------------------------------|------------------|------------------|
 * | Cookie                         | 8                | 0                |
 * | Data Offset                    | 8                | 8                |
 * | Table Offset                   | 8                | 16               |
 * | Header Version                 | 4                | 24               |
 * | Max Table Entries              | 4                | 28               |
 * | Block Size                     | 4                | 32               |
 * | Checksum                       | 4                | 36               |
 * | Parent Unique ID               | 16               | 40               |
 * | Parent Time Stamp              | 4                | 56               |
 * | Reserved                       | 4                | 60               |
 * | Parent Unicode Name            | 512              | 64               |
 * | Parent Locator Entry 1         | 24               | 576              |
 * | Parent Locator Entry 2         | 24               | 600              |
 * | Parent Locator Entry 3         | 24               | 624              |
 * | Parent Locator Entry 4         | 24               | 648              |
 * | Parent Locator Entry 5         | 24               | 672              |
 * | Parent Locator Entry 6         | 24               | 696              |
 * | Parent Locator Entry 7         | 24               | 720              |
 * | Parent Locator Entry 8         | 24               | 744              |
 * | Reserved                       | 256              | 768              |
 */
class Header {

  /**
   * Create a VHD Header
   * @returns {VHD.Header}
   */
  constructor() {

    /** @type {String} Cookie */
    this.cookie = ''
    /** @type {Number} Data offset */
    this.dataOffset = 0x0000000000000000
    /** @type {Number} Allocation table offset */
    this.tableOffset = 0x0000000000000000
    /** @type {VHD.Version} Header version */
    this.headerVersion = new VHD.Version( '1.0' )
    /** @type {Number} Maximum number of table entries */
    this.maxTableEntries = 0x00000000
    /** @type {Number} Size of a sector in bytes */
    this.sectorSize = 0x00000000
    /** @type {Number} Checksum */
    this.checksum = 0x00000000
    /** @type {Buffer} Unique ID of the parent VHD */
    this.parentUniqueId = Buffer.alloc( 16 )
    /** @type {Date} Timestamp of the parent VHD */
    this.parentTimeStamp = new Date( VHD.EPOCH )
    /** @type {Buffer} Reserved (4 bytes) */
    this.reserved1 = Buffer.alloc( 4 )
    /** @type {String} Unicode string name of the parent VHD */
    this.parentUnicodeName = ''
    /** @type {Array<VHD.Locator>} Parent VHD locator entries */
    this.parentLocator = [
      new VHD.Locator(),
      new VHD.Locator(),
      new VHD.Locator(),
      new VHD.Locator(),
      new VHD.Locator(),
      new VHD.Locator(),
      new VHD.Locator(),
      new VHD.Locator()
    ]
    /** @type {Buffer} Reserved (256 bytes) */
    this.reserved2 = Buffer.alloc( 256 )

  }

  /**
   * Parse the header from a buffer
   * @param {Buffer} buffer
   * @param {Object} [offset=0]
   * @returns {Buffer}
   */
  parse( buffer, offset ) {

    offset = offset || 0

    let toString = ( buffer, encoding, start, end ) => {
      var eod = Math.min( Math.max( start, buffer.indexOf( 0x00, start ) ), end )
      return buffer.toString( encoding, start, eod )
    }

    var signature = toString( buffer, 'ascii', offset + 0, offset + 8 )

    if( signature !== Header.SIGNATURE ) {
      throw new Error( `Invalid header signature "${signature}"; expected "${Header.SIGNATURE}"` )
    }

    this.cookie = signature
    this.dataOffset = int64.readUIntBE( buffer, offset + 8 )
    this.tableOffset = int64.readUIntBE( buffer, offset + 16 )
    this.headerVersion.parse( buffer, offset + 24 )
    this.maxTableEntries = buffer.readUInt32BE( offset + 28 )
    this.sectorSize = buffer.readUInt32BE( offset + 32 )
    this.checksum = buffer.readUInt32BE( offset + 36 )

    buffer.copy( this.parentUniqueId, 0, offset + 40, offset + 56 )

    this.parentTimeStamp.setTime( VHD.EPOCH + buffer.readUInt32BE( offset + 56 ) * 1000 )

    buffer.copy( this.reserved1, 0, offset + 60, offset + 64 )

    this.parentUnicodeName = toString( buffer, 'utf8', offset + 64, offset + 576 )

    this.parentLocator[0].parse( buffer, offset + 576 )
    this.parentLocator[1].parse( buffer, offset + 600 )
    this.parentLocator[2].parse( buffer, offset + 624 )
    this.parentLocator[3].parse( buffer, offset + 648 )
    this.parentLocator[4].parse( buffer, offset + 672 )
    this.parentLocator[5].parse( buffer, offset + 696 )
    this.parentLocator[6].parse( buffer, offset + 720 )
    this.parentLocator[7].parse( buffer, offset + 744 )

    buffer.copy( this.reserved2, 0, offset + 768, offset + 1024 )

    return this

  }

  /**
   * Write the header to a buffer
   * @param {Buffer} [buffer]
   * @param {Object} [offset=0]
   * @returns {Buffer}
   */
  write( buffer, offset ) {

    offset = offset || 0
    buffer = buffer || Buffer.alloc( Header.SIZE + offset )

    buffer.fill( 0x20, offset + 0, offset + 8 )
    buffer.write( this.cookie, offset + 0, offset + 8 )

    // The "null" value here is too large for JS to
    // handle as one number, hence we write 2 x uint32
    if( this.dataOffset === 0xFFFFFFFFFFFFFFFF ) {
      buffer.writeUInt32BE( 0xFFFFFFFF, offset + 8 )
      buffer.writeUInt32BE( 0xFFFFFFFF, offset + 12 )
    } else {
      int64.writeUIntBE( buffer, this.dataOffset, offset + 8 )
    }

    int64.writeUIntBE( buffer, this.tableOffset, offset + 16 )

    this.headerVersion.write( buffer, offset + 24 )

    buffer.writeUInt32BE( this.maxTableEntries, offset + 28 )
    buffer.writeUInt32BE( this.sectorSize, offset + 32 )
    buffer.writeUInt32BE( this.checksum, offset + 36 )

    this.parentUniqueId.copy( buffer, offset + 40 )

    buffer.writeUInt32BE( ( this.parentTimeStamp.getTime() - VHD.EPOCH ) / 1000, offset + 56 )

    this.reserved1.copy( buffer, offset + 60 )

    buffer.fill( 0x00, offset + 64, offset + 576 )
    buffer.write( this.parentUnicodeName, offset + 64, offset + 576, 'utf8' )

    this.parentLocator[0].write( buffer, offset + 576 )
    this.parentLocator[1].write( buffer, offset + 600 )
    this.parentLocator[2].write( buffer, offset + 624 )
    this.parentLocator[3].write( buffer, offset + 648 )
    this.parentLocator[4].write( buffer, offset + 672 )
    this.parentLocator[5].write( buffer, offset + 696 )
    this.parentLocator[6].write( buffer, offset + 720 )
    this.parentLocator[7].write( buffer, offset + 744 )

    this.reserved2.copy( buffer, offset + 768 )

    return buffer

  }

}

/**
 * VHD Header size in bytes
 * @type {Number}
 * @constant
 */
Header.SIZE = 1024

/**
 * VHD Header signature
 * @type {String}
 * @constant
 */
Header.SIGNATURE = 'cxsparse'

/**
 * Parse a VHD Header from a buffer
 * @param {Buffer} [buffer]
 * @param {Object} [offset=0]
 * @returns {Buffer}
 */
Header.parse = function( buffer, offset ) {
  return new Header().parse( buffer, offset )
}

module.exports = Header
