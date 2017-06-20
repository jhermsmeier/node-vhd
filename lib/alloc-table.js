var VHD = require( './vhd' )

/**
 * Marker value for unallocated sectors
 * @const {Number}
 */
var FREE = 0xFFFFFFFF // 4294967295

/**
 * AllocationTable
 * @constructor
 * @memberOf VHD
 * @returns {AllocationTable}
 */
function AllocationTable() {

  if( !(this instanceof AllocationTable) ) {
    return new AllocationTable()
  }

  this.sectors = []

  // TODO: Impl `dirty` sector flags

}

/**
 * Parse an allocation table buffer
 * @param {Buffer} buffer
 * @param {Object} [offset=0]
 * @returns {AllocationTable}
 */
AllocationTable.parse = function( buffer, offset ) {
  return new AllocationTable().parse( buffer, offset )
}

/**
 * AllocationTable prototype
 * @type {Object}
 * @ignore
 */
AllocationTable.prototype = {

  constructor: AllocationTable,

  get length() { return this.sectors.length * 4 },

  get size() { return this.sectors.length },
  set size( value ) { this.resize( value ) },

  /**
   * Resize the table to a given sector count
   * @param {Number} sectorCount
   */
  resize( sectorCount ) {

    if( !isFinite( sectorCount ) || sectorCount < 0 ) {
      throw new Error( 'New sector count must be a positive integer' )
    }

    if( sectorCount > this.sectors.length ) {
      while( this.sectors.length < sectorCount ) {
        this.sectors.push( FREE )
      }
    }

    if( sectorCount < this.sectors.length ) {
      this.sectors.length = sectorCount
    }

    return this.sectors.length

  },

  /**
   * Determine whether a sector is unallocated
   * @param {Number} sector
   * @returns {Boolean}
   */
  needsAllocation( sector ) {
    return this.sectors[ sector ] === FREE
  },

  /**
   * Parse an allocation table buffer
   * @param {Buffer} buffer
   * @param {Object} [offset=0]
   * @returns {AllocationTable}
   */
  parse( buffer, offset ) {

    this.sectors = []

    offset = offset || 0

    var length = buffer.length
    var sectorCount = ( length - offset ) / 4

    while( offset < length ) {
      this.sectors.push( buffer.readUInt32BE( offset ) )
      offset = offset + 4
    }

    return this

  },

  /**
   * Write the table to a given buffer
   * @param {Buffer} buffer
   * @param {Number} [offset=0]
   * @returns {Buffer}
   */
  write( buffer, offset ) {

    offset = offset || 0

    var sectorCount = this.sectors.length

    for( var i = 0; i < sectorCount; i++ ) {
      buffer.writeUInt32BE( this.sectors[i], offset )
      offset = offset + 4
    }

    return buffer

  },

  /**
   * Create a buffer from the allocation table
   * @returns {Buffer}
   */
  toBuffer() {
    var buffer = Buffer.alloc( this.sectors.length * 4 )
    return this.write( buffer )
  },

}

module.exports = AllocationTable
