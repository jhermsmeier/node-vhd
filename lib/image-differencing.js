var VHD = require( './vhd' )
var fs = require( 'fs' )

module.exports = {

  /**
   * Get the sector number for a given logical block address (LBA)
   * @param {Number} lba
   * @returns {Number} sectorNumber
   */
  sectorNumber( lba ) {
    return Math.floor( lba / this.blocksPerSector )
  },

  /**
   * Get the block number within a sector for a given logical block address (LBA)
   * @param {Number} lba
   * @returns {Number} blockNumber
   */
  blockInSector( lba ) {
    return lba % this.blocksPerSector
  },

  _readDiff( buffer, offset, length, position, callback ) {

    if( this.footer.diskType !== VHD.TYPE.DIFF ) {
      throw new Error( `Image is not a differencing disk` )
    }

    callback.call( this, new Error( 'image._readDiff() not implemented' ) )

  },

  _writeDiff( buffer, offset, length, position, callback ) {

    if( this.footer.diskType !== VHD.TYPE.DIFF ) {
      throw new Error( `Image is not a differencing disk` )
    }

    callback.call( this, new Error( 'image._writeDiff() not implemented' ) )

  },

}
