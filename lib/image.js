var fs = require( 'fs' )
var async = require( './async' )
var VHD = require( './vhd' )
var debug = require( 'debug' )( 'vhd:image' )

class Image {

  constructor( options ) {

    options = Object.assign( {}, Image.defaults, options )

    this.fd = null
    this.path = options.path
    this.flags = options.flags
    this.mode = options.mode

    this.header = null
    this.footer = null
    this.table = null

  }

  get type() {
    return this.footer ? this.footer.diskType : null
  }

  get size() {
    return this.header != null ?
      this.header.maxTableEntries * this.header.sectorSize :
      this.footer.currentSize
  }

  get sectorSize() {
    return this.header != null ?
      this.header.sectorSize :
      VHD.SECTOR_SIZE
  }

  get blocksPerSector() {
    return this.sectorSize / VHD.BLOCK_SIZE
  }

  get bitmapBlocks() {
    return Math.ceil( this.blocksPerSector / VHD.BLOCK_SIZE / 8 )
  }

  sectorNumber( lba ) {
    return Math.floor( lba / this.blocksPerSector )
  }

  blockInSector( lba ) {
    return lba % this.blocksPerSector
  }

  readFooter( callback ) {

    fs.fstat( this.fd, ( error, stats ) => {

      if( error ) {
        return void callback.call( this, error )
      }

      var buffer = Buffer.allocUnsafe( VHD.Footer.SIZE )
      var position = stats.size - VHD.Footer.SIZE

      fs.read( this.fd, buffer, 0, buffer.length, position, ( error, bytesRead, buffer ) => {

        if( error || bytesRead !== buffer.length ) {
          error = error || new Error( `Expected ${buffer.length} bytes, read ${bytesRead}` )
          return void callback.call( this, error )
        }

        try {
          this.footer = this.footer || new VHD.Footer()
          this.footer.parse( buffer )
        } catch( e ) {
          error = e
        }

        callback.call( this, error, this.footer )

      })

    })

  }

  readHeader( callback ) {

    if( this.type !== VHD.TYPE.DYNAMIC && this.type !== VHD.TYPE.DIFF ) {
      return void callback.call( this, new Error( 'Attempt to read header for fixed or reserved image type' ) )
    }

    var buffer = Buffer.allocUnsafe( VHD.Header.SIZE )
    var position = this.footer.dataOffset

    fs.read( this.fd, buffer, 0, buffer.length, position, ( error, bytesRead, buffer ) => {

      if( error || bytesRead !== buffer.length ) {
        error = error || new Error( `Expected ${buffer.length} bytes, read ${bytesRead}` )
        return void callback.call( this, error )
      }

      try {
        this.header = this.header || new VHD.Header()
        this.header.parse( buffer )
      } catch( e ) {
        error = e
      }

      callback.call( this, error, this.header )

    })

  }

  readAllocationTable( callback ) {

    if( this.type !== VHD.TYPE.DYNAMIC && this.type !== VHD.TYPE.DIFF ) {
      return void callback.call( this, new Error( 'Attempt to read header for fixed or reserved image type' ) )
    }

    if( this.header == null ) {
      return void callback.call( this, new Error( 'Attempt to read allocation table offset while missing header' ) )
    }

    var length = this.header.maxTableEntries * VHD.TABLE_ENTRY_SIZE
    var buffer = Buffer.allocUnsafe( length )
    var position = this.header.tableOffset

    fs.read( this.fd, buffer, 0, length, position, ( error, bytesRead, buffer ) => {

      if( error || bytesRead !== buffer.length ) {
        error = error || new Error( `Expected ${buffer.length} bytes, read ${bytesRead}` )
        return void callback.call( this, error )
      }

      try {
        this.table = this.table || new VHD.AllocationTable()
        this.table.parse( buffer )
      } catch( e ) {
        error = e
      }

      callback.call( this, error, this.table )

    })

  }

  open( callback ) {

    async.series([
      ( next ) => {
        fs.open( this.path, this.flags, this.mode, ( error, fd ) => {
          this.fd = fd || null
          next( error )
        })
      },
      ( next ) => this.readFooter( next ),
      ( next ) => {
        if( this.type === VHD.TYPE.DYNAMIC || this.type === VHD.TYPE.DIFF ) {
          this.readHeader( next )
        } else {
          this.header = null
          next() // Fixed VHDs do not have headers
        }
      },
      ( next ) => {
        if( this.header != null ) {
          this.readAllocationTable( next )
        } else {
          this.table = null
          next()
        }
      },
    ], ( error ) => {
      callback.call( this, error )
    })

  }

  create( options, callback ) {
    throw new Error( 'Not implemented' )
  }

  _readFixed( buffer, offset, length, position, callback ) {

    debug( '_readFixed', position, length )

    // TODO: Handle nulled dataOffset and > MAX_SAFE_INT offsets properly
    position += this.footer.dataOffset >= Number.MAX_SAFE_INTEGER ?
      0 : this.footer.dataOffset

    debug( '_readFixed', position, length )

    fs.read( this.fd, buffer, offset, length, position, ( error, bytesRead, buffer ) => {
      if( bytesRead !== length ) {
        error = error || new Error( `Expected ${buffer.length} bytes, read ${bytesRead}` )
      }
      callback.call( this, error, bytesRead, buffer )
    })

  }

  _readSectorBitmap( sector, callback ) {

    if( sector >= this.table.length || this.table.sectors[ sector ] === VHD.SECTOR.FREE ) {
      return void callback.call( this, new Error( `Sector ${sector} not allocated` ) )
    }

    var position = this.table.sectors[ sector ] * this.blockSize
    var length = this.bitmapBlocks * this.blockSize
    var buffer = Buffer.allocUnsafe( length )

    fs.read( this.fd, buffer, 0, length, position, ( error, bytesRead, buffer ) => {
      if( bytesRead !== length ) {
        error = error || new Error( `Expected ${buffer.length} bytes, read ${bytesRead}` )
      }
      callback.call( this, error, bytesRead, buffer )
    })

  }

  _readDynamic( buffer, offset, length, position, callback ) {
    throw new Error( 'Not implemented' )
  }

  _readDiff( buffer, offset, length, position, callback ) {
    throw new Error( 'Not implemented' )
  }

  read( buffer, offset, length, position, callback ) {
    debug( 'read', position, length )
    switch( this.footer.diskType ) {
      case VHD.TYPE.FIXED: this._readFixed( buffer, offset, length, position, callback ); break
      case VHD.TYPE.DYNAMIC: this._readDynamic( buffer, offset, length, position, callback ); break
      case VHD.TYPE.DIFF: this._readDiff( buffer, offset, length, position, callback ); break
      default: throw new Error( `Invalid disk type "${this.footer.diskType}"` )
    }
  }

  readBlocks( fromLBA, toLBA, callback ) {

    debug( 'readBlocks', fromLBA, toLBA )

    var position = fromLBA * VHD.BLOCK_SIZE
    var length = ( toLBA - fromLBA ) * VHD.BLOCK_SIZE
    var buffer = Buffer.allocUnsafe( length )
    var offset = 0

    this.read( buffer, offset, length, position, callback )

  }

  _writeFixed( buffer, offset, length, position, callback ) {

    // TODO: Handle nulled dataOffset and > MAX_SAFE_INT offsets properly
    position += this.footer.dataOffset >= Number.MAX_SAFE_INTEGER ?
      0 : this.footer.dataOffset

    debug( '_writeFixed', position, length )

    fs.write( this.fd, buffer, offset, length, position, ( error, bytesWritten, buffer ) => {
      callback.call( this, error, bytesWritten, buffer )
    })

  }

  _writeDynamic( buffer, offset, length, position, callback ) {
    throw new Error( 'Not implemented' )
  }

  _writeDiff( buffer, offset, length, position, callback ) {
    throw new Error( 'Not implemented' )
  }

  write( buffer, offset, length, position, callback ) {
    debug( 'write', position, length )
    switch( this.footer.diskType ) {
      case VHD.TYPE.FIXED: this._writeFixed( buffer, offset, length, position, callback ); break
      case VHD.TYPE.DYNAMIC: this._writeDynamic( buffer, offset, length, position, callback ); break
      case VHD.TYPE.DIFF: this._writeDiff( buffer, offset, length, position, callback ); break
      default: throw new Error( `Invalid disk type "${this.footer.diskType}"` )
    }
  }

  writeBlocks( buffer, fromLBA, callback ) {

    debug( 'writeBlocks', fromLBA, toLBA )

    var position = fromLBA * VHD.BLOCK_SIZE
    var length = buffer.length
    var offset = 0

    this.write( buffer, offset, length, position, callback )

  }

  close( callback ) {
    fs.close( this.fd, ( error ) => {
      callback.call( this, error )
    })
  }

  createReadStream() {
    return new VHD.ReadStream({ image: this, autoClose: false })
  }

  createWriteStream() {
    return new VHD.WriteStream({ image: this, autoClose: false })
  }

  createSparseReadStream() {
    return new VHD.SparseReadStream({ image: this, autoClose: false })
  }

  createSparseWriteStream() {
    return new VHD.SparseWriteStream({ image: this, autoClose: false })
  }

}

Image.defaults = {
  flags: 'r',
  mode: 0o666,
}

module.exports = Image
