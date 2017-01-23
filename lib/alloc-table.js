var VHD = require( './vhd' )

var UNALLOCATED = 0xFFFFFFFF // 4294967295

/**
 * AllocationTable
 * @constructor
 * @return {AllocationTable}
 */
function AllocationTable() {

  if( !(this instanceof AllocationTable) )
    return new AllocationTable()

  this.sectors = []

  // TODO: Impl `dirty` sector flags

}

/**
 * AllocationTable prototype
 * @type {Object}
 */
AllocationTable.prototype = {

  constructor: AllocationTable,

  get size() {
    return this.sectors.length
  },

  set size( value ) {
    this.sectors.length = value
  },

  needsAllocation: function( sector ) {
    return this.sectors[ sector ] === UNALLOCATED
  },

  parse: function( buffer ) {

    this.sectors.length = buffer.length / 4

    for( var offset = 0; offset < buffer.length - 4; offset += 4 ) {
      this.sectors[ offset / 4 ] = buffer.readUInt32BE( offset )
    }

    return this

  },

}

// Exports
module.exports = AllocationTable
