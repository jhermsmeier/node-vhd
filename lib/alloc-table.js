var VHD = require( './vhd' )

class AllocationTable {

  constructor() {
    /** @type {Array<Number>} Sector allocations */
    this.sectors = []
  }

  get size() {
    return this.sectors.length * VHD.TABLE_ENTRY_SIZE
  }

  get length() {
    return this.sectors.length
  }

  get( sector ) {
    return sector < this.sectors.length ?
      this.sectors[ sector ] : VHD.SECTOR.FREE
  }

  /**
   * Resize the table to a given sector count
   * @param {Number} sectorCount
   * @returns {Boolean} whether the table was resized
   */
  resize( sectorCount ) {

    if( !isFinite( sectorCount ) || sectorCount < 0 ) {
      throw new Error( 'New sector count must be a positive integer' )
    }

    if( sectorCount === this.sectors.length ) {
      return false
    } else if( sectorCount > this.sectors.length ) {
      while( this.sectors.length < sectorCount ) {
        this.sectors.push( VHD.SECTOR.FREE )
      }
      return true
    } else if( sectorCount < this.sectors.length ) {
      this.sectors.length = sectorCount
      return true
    }

    return false

  }

  /**
   * Determine whether a sector is unallocated
   * @param {Number} sector
   * @returns {Boolean}
   */
  needsAllocation( sector ) {
    return sector < this.sectors.length ?
      this.sectors[ sector ] === VHD.SECTOR.FREE :
      true
  }

  /**
   * Parse an allocation table buffer
   * @param {Buffer} buffer
   * @param {Object} [offset=0]
   * @returns {AllocationTable}
   */
  parse( buffer, offset, length ) {

    length = Math.floor( length || ( buffer.length / VHD.TABLE_ENTRY_SIZE ) )
    offset = offset || 0

    this.sectors.length = length

    for( var i = 0; i < length; i++ ) {
      this.sectors[i] = buffer.readUInt32BE( offset )
      offset += 4
    }

    return this

  }

  /**
   * Write the table to a given buffer
   * @param {Buffer} buffer
   * @param {Number} [offset=0]
   * @returns {Buffer}
   */
  write( buffer, offset ) {

    offset = offset || 0
    buffer = buffer || Buffer.alloc( this.size + offset )

    var length = this.sectors.length

    for( var i = 0; i < length; i++ ) {
      buffer.writeUInt32BE( this.sectors[i], offset )
      offset += 4
    }

    return buffer

  }

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

module.exports = AllocationTable
