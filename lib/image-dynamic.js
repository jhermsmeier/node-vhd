var VHD = require( './vhd' )
var async = require( './async' )
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
  getSectorAddress( sectorNumber ) {
    return sectorNumber < this.header.maxTableEntries ?
      this.bat.readUInt32BE( sectorNumber * VHD.TABLE_ENTRY_SIZE ) :
      VHD.SECTOR.FREE
  },

  /**
   * Determine whether a sector requires on-disk allocation
   * @param {Number} sectorNumber
   * @returns {Boolean} needsAllocation
   */
  sectorNeedsAllocation( sectorNumber ) {
    return sectorNumber < this.header.maxTableEntries ?
      this.getSectorAddress( sectorNumber ) === VHD.SECTOR.FREE :
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

    var address = this.getSectorAddress( sectorNumber )

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

  _readDynamic( buffer, offset, length, position, callback ) {

    if( this.footer.diskType !== VHD.TYPE.DYNAMIC && this.footer.diskType !== VHD.TYPE.DIFF ) {
      throw new Error( `Image is not a dynamic or differencing disk` )
    }

    var toRead = length
    var totalBytesRead = 0

    async.whilst(() => {
      return toRead > 0
    }, ( next ) => {

      var lba = Math.floor( position / VHD.BLOCK_SIZE )
      var sectorNumber = this.sectorNumber( lba )

      var sectorPosition = this.header.sectorSize * sectorNumber
      // Offset of the read position inside the sector
      var sectorOffset = position - sectorPosition
      // Remaining bytes in sector
      var sectorLength = this.header.sectorSize - sectorOffset

      var chunkLength = Math.min( toRead, sectorLength )

      var address = this.getSectorAddress( sectorNumber )

      if( address === VHD.SECTOR.FREE ) {

        // Zerofill the region in the buffer
        process.nextTick(() => {
          buffer.fill( 0, offset, offset + chunkLength )
          offset += chunkLength
          position += chunkLength
          totalBytesRead += chunkLength
          toRead -= chunkLength
          next()
        })

      } else {

        // Calculate the address position in bytes
        address = ( address + this.bitmapBlocks ) * VHD.BLOCK_SIZE
        address += sectorOffset

        fs.read( this.fd, buffer, offset, chunkLength, address, ( error, bytesRead, buffer ) => {
          if( bytesRead !== length ) {
            error = error || new Error( `Expected ${length} bytes, got ${bytesRead}` )
          }
          position += bytesRead
          offset += bytesRead
          toRead -= bytesRead
          totalBytesRead += bytesRead
          next( error )
        })

      }

    }, ( error ) => {
      callback.call( this, error, totalBytesRead, buffer )
    })

  },

  _writeDynamic( buffer, offset, length, position, callback ) {

    if( this.footer.diskType !== VHD.TYPE.DYNAMIC && this.footer.diskType !== VHD.TYPE.DIFF ) {
      throw new Error( `Image is not a dynamic or differencing disk` )
    }

    callback.call( this, new Error( 'image._writeDynamic() not implemented' ) )

  },

}
