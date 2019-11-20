var stream = require( 'readable-stream' )
var VHD = require( './vhd' )

class WriteStream extends stream.Writable {

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
    this.bytesWritten = 0

    this.opened = false
    this.closed = false
    this.destroyed = false

    this.on( 'finish', () => {
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

  _write( buffer, encoding, next ) {

    if( !this.opened ) {
      return void this.once( 'open', () => this._read() )
    }

    next()

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

WriteStream.defaults = {
  flags: 'w',
  autoClose: true,
  highWaterMark: 64 * 1024,
}

module.exports = WriteStream
