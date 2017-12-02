var VHD = require( './vhd' )

function pad( str, chr, len ) {
  while( chr.length < len ) chr += chr
  return ( str + chr ).substring( 0, len )
}

/**
 * VHD Header
 * @constructor
 * @param {Object} options
 */
function Header( options ) {

  if( !(this instanceof Header) )
    return new Header( options )

  this.cookie              = '' // 8 bytes
  this.dataOffset          = 0 // 8 bytes
  this.tableOffset         = 0 // 8 bytes
  this.headerVersion       = new VHD.Version( '1.0' ) // 4 bytes
  this.maxTableEntries     = 0 // 4 bytes
  this.sectorSize          = 0 // 4 bytes
  this.checksum            = 0 // 4 bytes
  this.parentUniqueId      = new Buffer( 16 ) // 16 bytes
  this.parentTimeStamp     = new Date( VHD.EPOCH ) // 4 bytes
  // this.reserved         = 0 // 4 bytes
  this.parentUnicodeName   = '' // 512 bytes
  this.parentLocator       = new Array( 8 ) // 8 * 24 bytes each
  // this.reserved         = 0 // 256 bytes

}

Header.SIZE = 1024

Header.parse = function( buffer, offset ) {
  return new Header().parse( buffer, offset )
}

/**
 * Header Prototype
 * @type {Object}
 * @ignore
 */
Header.prototype = {

  constructor: Header,

  parse: function( value ) {

    var buffer = ( value instanceof Buffer ) ?
      value : new Buffer( value )

    // 8 bytes, utf-16
    this.cookie = buffer.toString( 'utf8', 0, 8 )
    // 8 bytes, uint64
    this.dataOffset = buffer.readUIntBE( 8, 8 )
    // 8 bytes, uint64
    this.tableOffset = buffer.readUIntBE( 16, 8 )
    // 4 bytes
    this.headerVersion.parse( buffer.slice( 24, 28 ) )
    // 4 bytes
    this.maxTableEntries = buffer.readUInt32BE( 28 )
    // 4 bytes
    this.sectorSize = buffer.readUInt32BE( 32 )
    // 4 bytes
    this.checksum = buffer.readUInt32BE( 36 )
    // 16 bytes
    buffer.copy( this.parentUniqueId, 0, 40 )
    // 4 bytes
    this.parentTimeStamp = new Date(
      VHD.EPOCH + buffer.readUInt32BE( 56 ) * 1000
    )
    // 4 bytes
    // this.reserved = 0
    // 512 bytes
    this.parentUnicodeName = buffer.toString( 'utf8', 64, 576 )
        .replace( /^[\s\u0000]+|[\s\u0000]+$/, '' )

    var offset = 512 + 64
    var end = offset + 8 * 24

    for( var i = 0; offset < end; offset += 24 ) {
      this.parentLocator[ i++ ] = VHD.Locator.parse( buffer, offset )
    }

    // 256 bytes
    // this.reserved = 0

    return this

  },

  valueOf: function() {

    var buffer = new Buffer( 1024 )

    buffer.fill( 0 )

    // 8 bytes, utf-16
    buffer.write( pad( this.cookie, ' ', 8 ), 0, 8, 'ascii' )
    // 8 bytes, uint64
    buffer.writeUIntBE( this.dataOffset, 8, 8 )
    // 8 bytes, uint64
    buffer.writeUIntBE( this.tableOffset, 16, 8 )
    // 4 bytes
    this.headerVersion.toBuffer().copy( buffer, 24 )
    // 4 bytes
    buffer.writeUInt32BE( this.maxTableEntries, 28 )
    // 4 bytes
    buffer.writeUInt32BE( this.sectorSize, 32 )
    // 4 bytes
    buffer.writeUInt32BE( this.checksum, 36 )
    // 16 bytes
    this.parentUniqueId.copy( buffer, 0, 40 )
    // 4 bytes
    var parentTimeStamp = this.parentTimeStamp.getTime()
        parentTimeStamp = ( parentTimeStamp - VHD.EPOCH ) / 1000

    buffer.writeUInt32BE( parentTimeStamp, 56 )

    // 4 bytes
    // this.reserved = 0

    // 512 bytes
    buffer.write( pad( this.parentUnicodeName, '\0', 512 ), 64, 576, 'utf8' )

    for( var i = 0; i < this.parentLocator.length; i++ ) {
      this.parentLocator[ i++ ].valueOf()
        .copy( buffer, 0, i * 24 )
    }

    // 256 bytes
    // this.reserved = 0

    return buffer

  },

}

// Exports
module.exports = Header
