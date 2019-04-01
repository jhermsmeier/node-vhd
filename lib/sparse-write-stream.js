var stream = require( 'readable-stream' )
var VHD = require( './vhd' )

class SparseWriteStream extends VHD.WriteStream {

  constructor( options ) {
    super( options )
  }

}

module.exports = SparseWriteStream
