var stream = require( 'readable-stream' )
var VHD = require( './vhd' )

class ReadStream extends stream.Readable {

  constructor( options ) {

    options = Object.assign( {}, ReadStream.defaults, options )

    super( options )

    this.image = options.image instanceof VHD.Image ?
      options.image : new VHD.Image({
        path: options.path,
        fd: options.fd,
      })

    this.autoClose = options.autoClose
    this.chunkSize = options.highWaterMark
    this.position = options.start || 0
    this.toRead = options.end ? options.end - this.position : Infinity
    this.bytesRead = 0

    this.opened = false
    this.closed = false
    this.destroyed = false

    this.on( 'end', () => {
      if( this.autoClose ) {
        this.close()
      }
    })

    this.open()

  }

  open() {

    if( !this.image.fd ) {
      this.image.open(( error ) => {
        if( error ) {
          this.emit( 'error', error )
        } else {
          this.opened = true
          this.emit( 'open' )
        }
      })
    } else {
      process.nextTick(() => {
        this.opened = true
        this.emit( 'open' )
      })
    }

  }

  _read() {

    if( !this.opened ) {
      return void this.once( 'open', () => this._read() )
    }

    var length = Math.min( this.toRead, this.chunkSize )
    var buffer = Buffer.allocUnsafe( length )
    var offset = 0
    var position = this.position

    this.image.read( buffer, offset, length, position, ( error, bytesRead, buffer ) => {

      if( error ) {
        return void this.destroy( error )
      }

      if( bytesRead === 0 ) {
        return void this.push( null )
      }

      this.position += bytesRead
      this.bytesRead += bytesRead
      this.toRead -= bytesRead

      this.push( buffer )

    })

  }

  close( callback ) {

    if( !this.image.fd || this.closed ) {
      this.once( 'open', () => {
        this.close( callback )
      })
      return
    }

    this.image.close(( error ) => {
      callback.call( this, error )
      this.emit( 'close' )
    })

  }

  _destroy( error, callback ) {
    callback( error )
  }

}

ReadStream.defaults = {
  flags: 'r',
  autoClose: true,
  highWaterMark: 64 * 1024,
}

module.exports = ReadStream
