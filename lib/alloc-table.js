var VHD = require( './vhd' )

/**
 * AllocationTable
 * @constructor
 * @return {AllocationTable}
 */
function AllocationTable() {

  if( !(this instanceof AllocationTable) )
    return new AllocationTable()

  this.blocks = []

}

/**
 * AllocationTable prototype
 * @type {Object}
 */
AllocationTable.prototype = {

  constructor: AllocationTable,

  get size() {
    return this.blocks.length
  },

  set size( value ) {
    this.blocks.length = value
  },

  parse: function( buffer ) {

    this.blocks.length = buffer.length / 4

    for( var offset = 0; offset < buffer.length - 4; offset += 4 ) {
      this.blocks[ offset / 4 ] = buffer.readUInt32BE( offset )
    }

    return this

  },

}

// Exports
module.exports = AllocationTable
