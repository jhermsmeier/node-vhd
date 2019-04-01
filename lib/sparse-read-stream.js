var stream = require( 'readable-stream' )
var VHD = require( './vhd' )

class SparseReadStream extends VHD.ReadStream {

  constructor( options ) {
    super( options )
  }

}

module.exports = SparseReadStream
