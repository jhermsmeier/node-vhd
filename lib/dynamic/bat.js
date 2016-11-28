var VHD = require( '../vhd' )

/**
 * Block Allocation Table
 * @constructor
 * @param {Buffer} value
 */
function AllocationTable( value ) {

  if( !(this instanceof AllocationTable) )
    return new AllocationTable( value )

  if( value instanceof Buffer ) {
    this.parse( value )
  }

}

/**
 * Block Allocation Table Prototype
 * @type {Object}
 * @ignore
 */
AllocationTable.prototype = {

  constructor: AllocationTable,

  get length() {
    return Object.keys( this ).length
  },

  set length( value ) {
    throw new Error( 'Not implemented' )
  },

  parse: function( value ) {

    var buffer = ( value instanceof Buffer ) ?
      value : new Buffer( value )

    for( var offset = 0; offset < buffer.length - 4; offset += 4 ) {
      this[ offset / 4 ] = buffer.readUInt32BE( offset )
    }

    return this

  },

  valueOf: function() {
    return new Buffer( 0 )
  },

}

// Exports
module.exports = AllocationTable
