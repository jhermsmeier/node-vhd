var VHD = require( './vhd' )

/**
 * Parent Locator Entry
 * @constructor
 * @param {Buffer} value
 */
function Locator( value ) {

  if( !(this instanceof Locator) )
    return new Locator( value )

  /** @type {Number} See Locator.PLATFORM */
  this.platformCode = 0
  /** @type {Number} [description] */
  this.dataSpace = 0
  /** @type {Number} [description] */
  this.dataLength = 0
  /** @type {Number} [description] */
  this.reserved = 0
  /** @type {Number} [description] */
  this.dataOffset = 0

  if( value instanceof Buffer ) {
    this.parse( value )
  }

}

/**
 * Structure size in bytes
 * @const {Number}
 */
Locator.SIZE = 24

/**
 * Locator Entry Platform Codes
 * @type {Object}
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

Locator.parse = function( buffer, offset ) {
  return new Locator().parse( buffer, offset )
}

/**
 * Parent Locator Entry Prototype
 * @type {Object}
 */
Locator.prototype = {

  constructor: Locator,

  get platform() {
    return Locator.PLATFORM[ this.platformCode ] ||
      Locator.PLATFORM[ 0x00000000 ]
  },

  set platform( value ) {
    for( var code in Locator.PLATFORM ) {
      if( Locator.PLATFORM[ code ] === value ) {
        this.platformCode = code
        break
      }
    }
  },

  parse( buffer, offset ) {

    offset = offset || 0

    this.platformCode = buffer.readUInt32BE( offset + 0 )
    this.dataSpace = buffer.readUInt32BE( offset + 4 )
    this.dataLength = buffer.readUInt32BE( offset + 8 )
    this.dataOffset = buffer.readUIntBE( offset + 12, 8 )

    return this

  },

  write( buffer, offset ) {

    buffer = buffer || Buffer.alloc( Locator.SIZE )
    offset = offset || 0

    buffer.writeUInt32BE( this.platformCode, offset + 0 )
    buffer.writeUInt32BE( this.dataSpace, offset + 4 )
    buffer.writeUInt32BE( this.dataLength, offset + 8 )
    buffer.writeUIntBE( this.dataOffset, offset + 12, 8 )

    return buffer

  },

}

// Exports
module.exports = Locator
