var fs = require( 'fs' )
var VHD = require( './vhd' )
var async = require( './async' )

class Image {

  constructor( options ) {

    this.fd = options.fd || null
    this.path = options.path || null
    this.flags = options.flags || 'r+'
    this.mode = options.mode || 0o666

    /** @type {Buffer} Block allocation table */
    this.bat = null
    /** @type {VHD.Header} [description] */
    this.header = null
    /** @type {VHD.Footer} [description] */
    this.footer = null

  }

  /** @property {VHD.TYPE} type - Disk image type */
  get type() {
    return this.footer ? this.footer.diskType : null
  }

  /** @property {Number} size - Size of the disk image in bytes */
  get size() {
    return this.header != null ?
      this.header.maxTableEntries * this.header.sectorSize :
      this.footer.currentSize
  }

  /** @property {Number} sectorSize - Sector size in bytes */
  get sectorSize() {
    return this.header != null ?
      this.header.sectorSize :
      VHD.SECTOR_SIZE
  }

  /** @property {Number} blocksPerSector - Number of blocks contained in a sector */
  get blocksPerSector() {
    return this.sectorSize / VHD.BLOCK_SIZE
  }

  /** @property {Number} bitmapBlocks - Number of blocks occupied by the sector bitmap */
  get bitmapBlocks() {
    return Math.ceil( this.blocksPerSector / VHD.BLOCK_SIZE / 8 )
  }

  /**
   * Open the VHD image for reading & manipulation
   * @param {Function} callback - callback( error )
   * @returns {undefined}
   */
  open( callback ) {

    var stats = null

    async.series([
      // Open file descriptor
      ( next ) => {
        fs.open( this.path, this.flags, this.mode, ( error, fd ) => {
          this.fd = fd || null
          next( error )
        })
      },
      // Stat to get size
      ( next ) => {
        fs.fstat( this.fd, ( error, result ) => {
          stats = result
          next( error )
        })
      },
      // Read the trailing footer
      ( next ) => {
        var position = stats.size - VHD.FOOTER_SIZE
        this.readFooter( position, ( error, footer, checksum ) => {
          // Verify checksum
          if( footer && footer.checksum !== checksum ) {
            // TODO: Fall back to secondary footer at offset 0,
            // if it can be determined to be a dynamic or differencing disk
            error = error || new Error( `Footer checksum mismatch "${checksum}" != "${footer.checksum}"` )
          }
          this.footer = footer
          next( error )
        })
      },
      // Read header, if it's a dynamic or differencing disk image
      ( next ) => {
        var type = this.footer.diskType
        if( type == VHD.TYPE.DYNAMIC || type == VHD.TYPE.DIFF ) {
          var position = Number( this.footer.dataOffset )
          this.readHeader( position, ( error, header, checksum ) => {
            // Verify checksum
            if( header && header.checksum !== checksum ) {
              error = error || new Error( `Header checksum mismatch "${checksum}" != "${header.checksum}"` )
            }
            this.header = header
            next( error )
          })
        } else {
          next()
        }
      },
      // Read allocation table / sector map
      ( next ) => {
        var type = this.footer.diskType
        if( type == VHD.TYPE.DYNAMIC || type == VHD.TYPE.DIFF ) {
          var position = Number( this.header.tableOffset )
          var length = this.header.maxTableEntries * VHD.TABLE_ENTRY_SIZE
          this.readAllocationTable( position, length, ( error, buffer ) => {
            this.bat = buffer || null
            next( error )
          })
        } else {
          next()
        }
      }
      // TODO: Check whether image is currently mounted or
      // in a dirty state, and fail appropriately
    ], ( error ) => {
      callback.call( this, error )
    })

  }

  /**
   * Read data from a given position
   * @param {Buffer|TypedArray|DataView} buffer
   * @param {Number} offset
   * @param {Number} length
   * @param {Number} position
   * @param {Function} callback - callback( error, bytesRead, buffer )
   */
  read( buffer, offset, length, position, callback ) {
    switch( this.footer.diskType ) {
      case VHD.TYPE.FIXED: this._readFixed( buffer, offset, length, position, callback ); break
      case VHD.TYPE.DYNAMIC: this._readDynamic( buffer, offset, length, position, callback ); break
      case VHD.TYPE.DIFF: this._readDiff( buffer, offset, length, position, callback ); break
      default: throw new Error( `Invalid disk type "${this.footer.diskType}"` )
    }
  }

  createReadStream( options ) {
    options = Object.assign({ image: this, autoClose: false }, options )
    return new VHD.ReadStream( options )
  }

  /**
   * Write `buffer` to a given position
   * @param {Buffer|TypedArray|DataView} buffer
   * @param {Number} offset
   * @param {Number} length
   * @param {Number} position
   * @param {Function} callback - callback( error, bytesWritten, buffer )
   */
  write( buffer, offset, length, position, callback ) {
    switch( this.footer.diskType ) {
      case VHD.TYPE.FIXED: this._writeFixed( buffer, offset, length, position, callback ); break
      case VHD.TYPE.DYNAMIC: this._writeDynamic( buffer, offset, length, position, callback ); break
      case VHD.TYPE.DIFF: this._writeDiff( buffer, offset, length, position, callback ); break
      default: throw new Error( `Invalid disk type "${this.footer.diskType}"` )
    }
  }

  createWriteStream( options ) {
    options = Object.assign({ image: this, autoClose: false }, options )
    return new VHD.WriteStream( options )
  }

  /**
   * Close the VHD image
   * @param {Function} callback - callback( error )
   * @returns {undefined}
   */
  close( callback ) {
    fs.close( this.fd, ( error ) => {
      callback && callback.call( this, error )
    })
  }

  /**
   * Read a VHD header from the image at a given position
   * @param {Number} position
   * @param {Function} callback - callback( error, header, checksum )
   * @returns {undefined}
   */
  readHeader( position, callback ) {

    if( this.type !== VHD.TYPE.DYNAMIC && this.type !== VHD.TYPE.DIFF ) {
      return void callback.call( this, null )
    }

    var offset = 0
    var length = VHD.Header.SIZE
    var buffer = Buffer.allocUnsafe( length )

    fs.read( this.fd, buffer, offset, length, position, ( error, bytesRead, buffer ) => {

      if( error || bytesRead !== buffer.length ) {
        error = error || new Error( `Expected ${buffer.length} bytes, read ${bytesRead}` )
        return void callback.call( this, error )
      }

      var header = null
      try { header = new VHD.Header().parse( buffer ) }
      catch( e ) { error = e }

      // Clear checksum value
      buffer.writeUInt32LE( 0, VHD.Header.CHECKSUM_OFFSET )
      // Calculate footer checksum
      var checksum = VHD.checksum( buffer )

      callback.call( this, error, header, checksum )

    })

  }

  /**
   * Read the allocation table buffer from a given position
   * @param {Number} position
   * @param {Number} length
   * @param {Function} callback - callback( error, buffer )
   * @returns {undefined}
   */
  readAllocationTable( position, length, callback ) {

    var offset = 0
    var buffer = Buffer.allocUnsafe( length )

    fs.read( this.fd, buffer, offset, length, position, ( error, bytesRead, buffer ) => {

      if( error || bytesRead !== buffer.length ) {
        error = error || new Error( `Expected ${buffer.length} bytes, read ${bytesRead}` )
        return void callback.call( this, error )
      }

      callback.call( this, error, buffer )

    })

  }

  /**
   * Read a VHD footer from the image at a given position
   * @param {Number} position
   * @param {Function} callback - callback( error, footer, checksum )
   * @returns {undefined}
   */
  readFooter( position, callback ) {

    var offset = 0
    var length = VHD.Footer.SIZE
    var buffer = Buffer.allocUnsafe( length )

    fs.read( this.fd, buffer, offset, length, position, ( error, bytesRead, buffer ) => {

      if( error || bytesRead !== buffer.length ) {
        error = error || new Error( `Expected ${buffer.length} bytes, read ${bytesRead}` )
        return void callback.call( this, error )
      }

      var footer = null
      try { footer = new VHD.Footer().parse( buffer ) }
      catch( e ) { error = e }

      // Clear checksum value
      buffer.writeUInt32LE( 0, VHD.Footer.CHECKSUM_OFFSET )
      // Calculate footer checksum
      var checksum = VHD.checksum( buffer )

      callback.call( this, error, footer, checksum )

    })

  }

}

// Methods for fixed images
Object.assign( Image.prototype, require( './image-fixed' ) )
// Methods for dynamic images
Object.assign( Image.prototype, require( './image-dynamic' ) )
// Methods for differencing images
Object.assign( Image.prototype, require( './image-differencing' ) )

module.exports = Image
