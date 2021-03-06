var VHD = require( './vhd' )
var fs = require( 'fs' )

module.exports = {

  /**
   * @internal Read data into `buffer` from fixed disk backing store
   * @param {Buffer} buffer
   * @param {Number} offset
   * @param {Number} length
   * @param {Number} position
   * @param {Function} callback - callback( error, bytesWritten, buffer )
   */
  _readFixed( buffer, offset, length, position, callback ) {

    if( this.footer.diskType !== VHD.TYPE.FIXED ) {
      throw new Error( `Image is not a fixed disk` )
    }

    // Add `dataOffset` to position, if necessary
    if( this.footer.dataOffset !== VHD.NULL_OFFSET ) {
      position += Number( this.footer.dataOffset )
    }

    fs.read( this.fd, buffer, offset, length, position, ( error, bytesRead, buffer ) => {
      if( bytesRead !== length ) {
        error = error || new Error( `Expected ${length} bytes, got ${bytesRead}` )
      }
      callback.call( this, error, bytesRead, buffer )
    })

  },

  /**
   * @internal Write `buffer` to fixed disk backing store
   * @param {Buffer} buffer
   * @param {Number} offset
   * @param {Number} length
   * @param {Number} position
   * @param {Function} callback - callback( error, bytesWritten, buffer )
   */
  _writeFixed( buffer, offset, length, position, callback ) {

    if( this.footer.diskType !== VHD.TYPE.FIXED ) {
      throw new Error( `Image is not a fixed disk` )
    }

    // Add `dataOffset` to position, if necessary
    if( this.footer.dataOffset !== VHD.NULL_OFFSET ) {
      position += Number( this.footer.dataOffset )
    }

    fs.write( this.fd, buffer, offset, length, position, ( error, bytesWritten, buffer ) => {
      if( bytesWritten !== length ) {
        error = error || new Error( `Expected ${length} bytes written, wrote ${bytesWritten}` )
      }
      callback.call( this, error, bytesWritten, buffer )
    })

  },

}
