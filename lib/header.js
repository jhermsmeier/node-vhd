var VHD = require( './vhd' )

class Header {

  /**
   * Create a VHD Header structure
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
   * @returns {VHD.Header}
   */
  constructor() {

    this.signature = Header.SIGNATURE
    /** @type {Number} Data offset */
    this.dataOffset = 0xFFFFFFFFFFFFFFFFn
    /** @type {Number} Allocation table offset */
    this.tableOffset = 0xFFFFFFFFFFFFFFFFn
    /** @type {Object} Header version */
    this.headerVersion = { major: 1, minor: 0 }
    /** @type {Number} Maximum number of table entries */
    this.maxTableEntries = 0x00000000
    /** @type {Number} Size of a sector in bytes */
    this.sectorSize = 0x00000000
    /** @type {Number} Checksum */
    this.checksum = 0x00000000
    /** @type {Buffer} UUID of the parent VHD */
    this.parentId = Buffer.alloc( 16 )
    /** @type {Number} Timestamp of the parent VHD */
    this.parentTimestamp = VHD.EPOCH
    /** @type {Number} Reserved (4 bytes) */
    this.reserved1 = 0x00000000
    /** @type {String} Unicode string name of the parent VHD */
    this.parentName = ''
    /** @type {Array<VHD.Locator>} Parent VHD locator entries */
    this.parentLocators = []
    /** @type {Buffer} Reserved (256 bytes) */
    this.reserved2 = Buffer.alloc( 256 )

  }

  static parse( buffer, offset ) {
    return new Header().parse( buffer, offset )
  }

  parse( buffer, offset ) {

    offset = offset || 0

    this.signature = buffer.toString( 'ascii', offset + 0, offset + 8 )

    if( this.signature !== Header.SIGNATURE ) {
      throw new Error( `Invalid header signature "${this.signature}"; expected "${Header.SIGNATURE}"` )
    }

    this.dataOffset = buffer.readBigUInt64BE( offset + 8 )
    this.tableOffset = buffer.readBigUInt64BE( offset + 16 )
    this.headerVersion.major = buffer.readUInt16BE( offset + 24 )
    this.headerVersion.minor = buffer.readUInt16BE( offset + 26 )
    this.maxTableEntries = buffer.readUInt32BE( offset + 28 )
    this.sectorSize = buffer.readUInt32BE( offset + 32 )
    this.checksum = buffer.readUInt32BE( offset + 36 )
    buffer.copy( this.parentId, 0, offset + 40, offset + 56 )
    this.parentTimestamp = ( buffer.readUInt32BE( offset + 56 ) * 1000 ) + VHD.EPOCH
    this.reserved1 = buffer.readUInt32BE( offset + 60 )
    this.parentName = buffer.toString( 'utf16le', offset + 64, offset + 576 )

    var index = this.parentName.indexOf( '\u0000' )
    if( index != -1 ) {
      this.parentName = this.parentName.slice( 0, index )
    }

    for( var i = 0; i < Header.PARENT_LOCATOR_COUNT; i++ ) {
      let locatorOffset = offset + 576 + ( i * 24 )
      let locatorDataOffset = buffer.readBigUInt64BE( locatorOffset + 12 )
      if( locatorDataOffset != 0n ) {
        this.parentLocators.push( new VHD.Locator().parse() )
      }
    }

    buffer.copy( this.reserved2, 0, offset + 768, offset + 1024 )

    this.calculatedChecksum = VHD.checksum( buffer, offset, offset + Header.SIZE )

    return this

  }

  write( buffer, offset ) {

    offset = offset || 0
    buffer = buffer || Buffer.alloc( Header.SIZE + offset )

    buffer.fill( 0, offset, offset + Header.SIZE )

    buffer.write( this.signature, offset, 8, 'ascii' )
    offset += 8

    offset = buffer.writeBigUInt64BE( this.dataOffset, offset )
    offset = buffer.writeBigUInt64BE( this.tableOffset, offset )
    offset = buffer.writeUInt16BE( this.headerVersion.major, offset )
    offset = buffer.writeUInt16BE( this.headerVersion.minor, offset )
    offset = buffer.writeUInt32BE( this.maxTableEntries, offset )
    offset = buffer.writeUInt32BE( this.sectorSize, offset )

    // Keep checksum clear for calculation
    offset = buffer.writeUInt32BE( 0x00000000, offset )

    offset += this.parentId.copy( buffer, offset, 0, 16 )
    offset = buffer.writeUInt32BE( ( this.parentTimestamp - VHD.EPOCH ) / 1000, offset )
    offset = buffer.writeUInt32BE( this.reserved1, offset )

    buffer.write( this.parentName, offset, 512, 'utf16le' )
    offset += 512

    for( var i = 0; i < Header.PARENT_LOCATOR_COUNT; i++ ) {
      if( this.parentLocators[i] ) {
        this.parentLocators[i].write( buffer, offset )
      }
      offset += VHD.Locator.SIZE
    }

    offset += this.reserved2.copy( buffer, offset, 0, 256 )

    // Calculate & write checksum
    var checksum = VHD.checksum( buffer, offset - Header.SIZE, offset )
    var checksumOffset = offset - Header.SIZE + Header.CHECKSUM_OFFSET

    buffer.writeUInt32BE( checksum, checksumOffset )

    return buffer

  }

}

/**
 * VHD Header size in bytes
 * @type {Number}
 * @constant
 * @default
 */
Header.SIZE = 1024

/**
 * Number of parent locators in a VHD header
 * @type {Number}
 * @constant
 * @default
 */
Header.PARENT_LOCATOR_COUNT = 8

/**
 * Relative offset of the header checksum
 * @type {Number}
 * @constant
 * @default
 */
Header.CHECKSUM_OFFSET = 36

/**
 * VHD Header signature
 * @type {String}
 * @constant
 * @default
 */
Header.SIGNATURE = 'cxsparse'

module.exports = Header
