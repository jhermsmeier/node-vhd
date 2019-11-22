var stream = require( 'readable-stream' )
var VHD = require( './vhd' )

class ReadStream extends stream.Readable {

  constructor( options ) {

    options.highWaterMark = options.highWaterMark || ( 64 * 1024 )

    super( options )

    this.fd = options.fd || null
    this.path = options.path || null
    this.flags = options.flags || 'r'
    this.mode = options.mode || 0o666

    this.image = options.image || null

    this.highWaterMark = options.highWaterMark

    this.position = options.start || 0
    this.bytesRead = 0
    this.toRead = this.image ? Number( this.image.footer.currentSize ) : -1
    this.toRead = Math.min( this.toRead, options.end || Infinity )

    this.autoClose = options.autoClose != null ?
      !!options.autoClose : true

  }

  _read( size ) {

    if( !this.image || !this.image.fd ) {
      return void this.once( 'open', () => void this._read() )
    }

    var offset = 0
    var length = Math.min( this.toRead, this.highWaterMark )
    var position = this.position
    var buffer = Buffer.allocUnsafe( length )

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

  _destroy( error, done ) {
    done( error )
  }

  open() {

    if( !this.image ) {
      this.image = new VHD.Image({
        fd: this.fd,
        path: this.path,
        flags: this.flags,
        mode: this.mode,
      })
    }

    if( !this.image.fd ) {
      image.open(( error ) => {
        if( error ) {
          this.emit( 'error', error )
        } else {
          this.toRead = Number( this.image.footer.currentSize )
          this.emit( 'open' )
        }
      })
    } else {
      process.nextTick(() => {
        this.emit( 'open' )
      })
    }

  }

  close( callback ) {

    if( !this.image.fd || this.closed ) {
      this.once( 'open', () => {
        this.close( callback )
      })
      return
    }

    this.image.close(( error ) => {
      callback && callback.call( this, error )
      this.emit( 'close' )
    })

  }

}

module.exports = ReadStream
