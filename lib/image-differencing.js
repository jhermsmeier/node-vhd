var VHD = require( './vhd' )
var fs = require( 'fs' )

module.exports = {

  /**
   * @internal Read data into `buffer` from differencing disk backing store
   * @param {Buffer} buffer
   * @param {Number} offset
   * @param {Number} length
   * @param {Number} position
   * @param {Function} callback - callback( error, bytesWritten, buffer )
   */
  _readDiff( buffer, offset, length, position, callback ) {

    if( this.footer.diskType !== VHD.TYPE.DIFF ) {
      throw new Error( `Image is not a differencing disk` )
    }

    callback.call( this, new Error( 'image._readDiff() not implemented' ) )

  },

  /**
   * @internal Write `buffer` to differencing disk backing store
   * @param {Buffer} buffer
   * @param {Number} offset
   * @param {Number} length
   * @param {Number} position
   * @param {Function} callback - callback( error, bytesWritten, buffer )
   */
  _writeDiff( buffer, offset, length, position, callback ) {

    if( this.footer.diskType !== VHD.TYPE.DIFF ) {
      throw new Error( `Image is not a differencing disk` )
    }

    callback.call( this, new Error( 'image._writeDiff() not implemented' ) )

  },

}
