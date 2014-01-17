var VHD = require( '../vhd' )
var Int64 = require( 'int64-native' )

/**
 * Parent Locator Entry Constructor
 * @param {Buffer} value
 */
function Locator( value ) {
  
  if( !(this instanceof Locator) )
    return new Locator( value )
  
  this.platformCode = 0
  this.dataSpace = 0
  this.dataLength = 0
  // this.reserved = 0
  this.dataOffset = 0
  
  if( value instanceof Buffer ) {
    this.parse( value )
  }
  
}

// Exports
module.exports = Locator

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
  
  parse: function( value ) {
    
    var buffer = ( value instanceof Buffer ) ?
      value : new Buffer( value )
    
    // 4 bytes
    this.platformCode =
      buffer.readUInt32BE( 0 )
    // 4 bytes
    this.dataSpace =
      buffer.readUInt32BE( 4 )
    // 4 bytes
    this.dataLength =
      buffer.readUInt32BE( 8 )
    // 8 bytes
    this.dataOffset = (new Int64(
      buffer.readUInt32BE( 12 ),
      buffer.readUInt32BE( 16 )
    ).toSignedDecimalString())
    
    return this
    
  },
  
  valueOf: function() {
    return new Buffer( 0 )
  }
  
}