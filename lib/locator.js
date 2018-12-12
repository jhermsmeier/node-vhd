var VHD = require( './vhd' )
var int64 = require( './int64' )

/**
 * Parent Locator Entry
 * @memberOf VHD
 * @class
 */
class Locator {

  /**
   * Create a Parent Locator Entry
   * @returns {Locator}
   */
  constructor() {

    /** @type {Number} See Locator.PLATFORM */
    this.platformCode = 0
    /** @type {Number} Data space */
    this.dataSpace = 0
    /** @type {Number} Data length */
    this.dataLength = 0
    /** @type {Number} Reserved */
    this.reserved = 0
    /** @type {Number} Data offset */
    this.dataOffset = 0

  }

  get platform() {
    return Locator.PLATFORM[ this.platformCode ] ||
      Locator.PLATFORM[ 0x00000000 ]
  }

  set platform( value ) {
    for( var code in Locator.PLATFORM ) {
      if( Locator.PLATFORM[ code ] === value ) {
        this.platformCode = code
        break
      }
    }
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
    this.dataOffset = int64.readUIntBE( buffer, offset + 12 )

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

    buffer.writeUInt32BE( this.platformCode, offset + 0 )
    buffer.writeUInt32BE( this.dataSpace, offset + 4 )
    buffer.writeUInt32BE( this.dataLength, offset + 8 )
    int64.writeUIntBE( buffer, this.dataOffset, offset + 12 )

    return buffer

  }

}

/**
 * VHD Locator Entry size in bytes
 * @const {Number}
 */
Locator.SIZE = 24

/**
 * Locator Entry Platform Codes
 * @type {Object<Number,String>}
 */
Locator.PLATFORM = {
  0x00000000: 'None',
  0x57693272: 'Wi2r',
  0x5769326B: 'Wi2k',
  0x57327275: 'W2ru',
  0x57326B75: 'W2ku',
  0x4D616320: 'Mac',
  0x4D616358: 'MacX',
}

/**
 * Parse a parent locator entry
 * @param {Buffer} buffer
 * @param {Object} [offset=0]
 * @returns {VHD.Locator}
 */
Locator.parse = function( buffer, offset ) {
  return new Locator().parse( buffer, offset )
}

module.exports = Locator
