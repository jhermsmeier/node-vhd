var VHD = require( './vhd' )
var fs = require( 'fs' )

module.exports = {

  _readDynamic( buffer, offset, length, position, callback ) {

    if( this.footer.diskType !== VHD.TYPE.DYNAMIC && this.footer.diskType !== VHD.TYPE.DIFF ) {
      throw new Error( `Image is not a dynamic or differencing disk` )
    }

    callback.call( this, new Error( 'image._readDynamic() not implemented' ) )

  },

  _writeDynamic( buffer, offset, length, position, callback ) {

    if( this.footer.diskType !== VHD.TYPE.DYNAMIC && this.footer.diskType !== VHD.TYPE.DIFF ) {
      throw new Error( `Image is not a dynamic or differencing disk` )
    }

    callback.call( this, new Error( 'image._writeDynamic() not implemented' ) )

  },

}
