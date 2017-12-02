var Stream = require( 'stream' )
var VHD = require( '../vhd' )

class ReadStream extends Stream.Readable {

  constructor( image, options ) {

    super( options )

    this.position = 0
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

    if( !this.image.fd ) {
      this.once( 'open', this._read )
      return
    }

    var toRead = this.image.footer.currentSize - this.bytesRead
    if( toRead <= 0 ) {
      return this.push( null )
    }

    // TODO: Ensure `highWaterMark` is a multiple of `image.blockSize`
    toRead = Math.min( toRead, this._readableState.highWaterMark )

    var fromLBA = this.position / this.image.blockSize
    var toLBA = ( this.position + toRead ) / this.image.blockSize
    var buffer = Buffer.alloc( toRead )

    this.image.readBlocks( fromLBA, toLBA, buffer, ( error, buffer, bytesRead ) => {

      if( error ) {
        return this.emit( 'error', error )
      }

      this.position += bytesRead
      this.bytesRead += bytesRead
      this.push( buffer )

    })

  }

}

module.exports = ReadStream
