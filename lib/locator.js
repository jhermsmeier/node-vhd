var VHD = require( './vhd' )
var { readBigUInt64BE, writeBigUInt64BE } = require( './buffer' )

class Locator {

  /**
   * Parent Locator Entry
   * @returns {VHD.Locator}
   */
  constructor() {

    /** @type {Number} See Locator.PLATFORM */
    this.platformCode = 0x00000000
    /** @type {Number} Data space */
    this.dataSpace = 0x00000000
    /** @type {Number} Data length */
    this.dataLength = 0x00000000
    /** @type {Number} Reserved */
    this.reserved = 0x00000000
    /** @type {Number} Data offset */
    this.dataOffset = 0x0000000000000000n

  }

  /**
   * Parse a parent locator entry
   * @param {Buffer} buffer
   * @param {Object} [offset=0]
   * @returns {VHD.Locator}
   */
  parse( buffer, offset ) {

    offset = offset || 0

    this.platformCode = buffer.readUInt32BE( offset + 0 )
    this.dataSpace = buffer.readUInt32BE( offset + 4 )
    this.dataLength = buffer.readUInt32BE( offset + 8 )
    this.dataOffset = readBigUInt64BE( buffer, offset + 12 )

    return this

  }

  /**
   * Write the locator entry to a buffer
   * @param {Buffer} [buffer]
   * @param {Object} [offset=0]
   * @returns {Buffer}
   */
  write( buffer, offset ) {

    buffer = buffer || Buffer.alloc( Locator.SIZE )
    offset = offset || 0

    offset = buffer.writeUInt32BE( this.platformCode, offset )
    offset = buffer.writeUInt32BE( this.dataSpace, offset )
    offset = buffer.writeUInt32BE( this.dataLength, offset )
    offset = writeBigUInt64BE( buffer, this.dataOffset, offset )

    return buffer

  }

}

/**
 * VHD Locator Entry size in bytes
 * @const {Number}
 */
Locator.SIZE = 24

module.exports = Locator
