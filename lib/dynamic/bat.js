var VHD = require( '../vhd' )

/**
 * Block Allocation Table Constructor
 * @param {Buffer} value
 */
function BAT( value ) {
  
  if( !(this instanceof BAT) )
    return new BAT( value )
  
  if( value instanceof Buffer ) {
    this.parse( value )
  }
  
}

/**
 * Block Allocation Table Prototype
 * @type {Object}
 */
BAT.prototype = {
  
  constructor: BAT,
  
  get length() {
    return Object.keys( this ).length
  },
  
  set length( value ) {
    
  },
  
  parse: function( value ) {
    
    var buffer = ( value instanceof Buffer ) ?
      value : new Buffer( value )
    
    var offset = 0
    
    for( ; offset < buffer.length - 4; offset += 4 ) {
      this[ offset / 4 ] = buffer.readUInt32BE( offset )
    }
    
    return this
    
  },
  
  valueOf: function() {
    return new Buffer( 0 )
  }
  
}

// Exports
module.exports = BAT
