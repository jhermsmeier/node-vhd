var Stream = require( 'stream' )
var VHD = require( '../vhd' )

class SparseReadStream extends Stream.Readable {

  constructor( image, options ) {

    options = options || {}
    options.objectMode = true

    super( options )

    this.bytesRead = 0
    this.image = !(image instanceof VHD.Dynamic) ?
      new VHD.Dynamic( image, options ) : image

    this.open()

  }

  open() {

    if( this.image.fd ) {
      return this.emit( 'open' )
    }

    this.image.open(( error ) => {
      if( error ) {
        return this.destroy( error )
      } else {
        this.emit( 'open' )
      }
    })

  }

  _read() {
    if( this.destroyed )
      return

    return this.emit( 'error', new Error( 'Not implemented' ) )

    this.push({
      data: buffer,
      length: buffer.length,
      position: this.position,
    })
  }

}

module.exports = SparseReadStream
