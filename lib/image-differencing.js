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

  /**
   * Get the sector value for a sector number
   * @param {Number} sectorNumber
   * @returns {Number} sectorAddress
   */
  getSector( sectorNumber ) {
    return sectorNumber < this.header.maxTableEntries ?
      this.bat.readUInt32LE( sectorNumber * VHD.TABLE_ENTRY_SIZE ) :
      VHD.SECTOR.FREE
  },

  /**
   * Determine whether a sector requires on-disk allocation
   * @param {Number} sectorNumber
   * @returns {Boolean} needsAllocation
   */
  sectorNeedsAllocation( sectorNumber ) {
    return sectorNumber < this.header.maxTableEntries ?
      this.getSector( sectorNumber ) === VHD.SECTOR.FREE :
      true
  },

  /**
   * Resize the Block Allocation Table (BAT)
   * @param {Number} newSectorCount
   * @returns {Boolean} hasResized
   */
  resizeAllocationTable( newSectorCount ) {

    if( !isFinite( newSectorCount ) || newSectorCount < 0 ) {
      throw new Error( 'New sector count must be a positive integer' )
    }

    // No need to resize to the same size
    if( newSectorCount === this.header.maxTableEntries ) {
      return false
    }

    // Allocate a new buffer with the given sector count
    var buffer = Buffer.alloc( newSectorCount * VHD.TABLE_ENTRY_SIZE, VHD.SECTOR.FREE )
    // Copy over the current BAT sectors
    this.bat.copy( buffer )
    // Replace the current BAT with the newly allocated buffer
    this.bat = buffer
    // Update `maxTableEntries`
    this.header.maxTableEntries = newSectorCount

    return true

  },

  /**
   * Read the sector bitmap for a given sector
   * @param {Number} sectorNumber
   * @param {Function} callback - callback( error, bitmapBuffer )
   * @returns {undefined}
   */
  readSectorBitmap( sectorNumber, callback ) {

    var address = this.getSector( sectorNumber )

    // TODO: Maybe there are more elegant ways to handle this case?
    if( address === VHD.SECTOR.FREE ) {
      return void callback.call( this, new Error( `Sector ${sectorNumber} not allocated` ) )
    }

    var offset = 0
    var position = address * VHD.BLOCK_SIZE
    var length = this.bitmapBlocks * VHD.BLOCK_SIZE
    var buffer = Buffer.allocUnsafe( length )

    fs.read( this.fd, buffer, offset, length, position, ( error, bytesRead, buffer ) => {

      if( bytesRead !== buffer.length ) {
        error = error || new Error( `Expected ${buffer.length} bytes, read ${bytesRead}` )
      }

      callback.call( this, error, buffer )

    })

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
