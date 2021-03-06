var VHD = module.exports
var pkg = require( '../package.json' )

/**
 * Default creator application string used
 * when creating new disk images
 * @type {String}
 * @constant
 */
VHD.CREATOR_APPLICATION = 'nvhd'

/**
 * Default creator version used when creating new disk images
 * @type {Object<String,Number>}
 * @constant
 */
VHD.CREATOR_VERSION = (function() {
  var [ major, minor ] = pkg.version.split( '.' )
  return { major: +major, minor: +minor }
})()

/**
 * The VHD's epoch (2000-01-01T00:00:00.000Z) in milliseconds
 * @type {Number}
 * @constant
 */
VHD.EPOCH = 946684800000

/**
 * Minimum size of a VHD image;
 * All disk types have a minimum size of 3 MB (3 * 1024 * 1024 bytes).
 * @type {Number}
 * @constant
 */
VHD.MIN_SIZE = 3145728

/**
 * Default VHD block size
 * @type {Number}
 * @constant
 */
VHD.BLOCK_SIZE = 512

/**
 * Default sector size is 2 MB,
 * a sector containing 4096 512 byte blocks
 * @type {Number}
 * @constant
 */
VHD.SECTOR_SIZE = VHD.BLOCK_SIZE * 4096

/**
 * Allocation table entry size in bytes
 * @type {Number}
 * @constant
 */
VHD.TABLE_ENTRY_SIZE = 4

/**
 * Size of the VHD header structure in bytes
 * @type {Number}
 * @constant
 */
VHD.HEADER_SIZE = 1024

/**
 * Size of the VHD footer structure in bytes
 * @type {Number}
 * @constant
 */
VHD.FOOTER_SIZE = 512

/**
 * [NULL_OFFSET description]
 * @type {BigInt}
 * @constant
 */
VHD.NULL_OFFSET = 0xFFFFFFFFFFFFFFFFn

/**
 * The maximum size of a dynamic hard disk is 2040 GB
 * @type {Number}
 * @constant
 */
VHD.MAX_DYNAMIC_SIZE = 2040 * ( 1024 ** 3 )

/**
 * Creator Host OS / Plaform Code
 * @description
 * The platform code describes which platform-specific format is used for the file locator.
 * For Windows, a file locator is stored as a path (for example. `"C:\\disksimages\\ParentDisk.vhd"` ).
 * On a Macintosh system, the file locator is a binary large object (blob) that contains an "alias".
 * The parent locator table is used to support moving hard disk images across platforms.
 * NOTE: For the creator host OS field, only two values are defined;
 * `WI2K` for Windows, and `MAC` for Macintosh
 * @enum {Number}
 */
VHD.PLATFORM = {
  /** @type {Number} None */
  NONE: 0x00000000,
  /** @type {Number} [deprecated] */
  WI2R: 0x57693272,
  /** @type {Number} [deprecated] */
  WI2K: 0x5769326B,
  /** @type {Number} Unicode pathname (UTF-16) on Windows relative to the differencing disk pathname */
  W2RU: 0x57327275,
  /** @type {Number} Absolute Unicode (UTF-16) pathname on Windows */
  W2KU: 0x57326B75,
  /** @type {Number} Mac OS alias stored as a blob */
  MAC:  0x4D616320,
  /** @type {Number} A file URL with UTF-8 encoding conforming to RFC 2396 */
  MACX: 0x4D616358,
}

/**
 * Feature flags
 * @enum {Number}
 */
VHD.FEATURES = {
  NONE:       0x00000000,
  TEMPORARY:  0x00000001,
  RESERVED:   0x00000002,
}

/**
 * VHD Image types
 * @enum {Number}
 */
VHD.TYPE = {
  NONE: 0,
  RESERVED_DEPRECATED1: 1,
  FIXED: 2,
  DYNAMIC: 3,
  DIFF: 4,
  RESERVED_DEPRECATED2: 5,
  RESERVED_DEPRECATED3: 6,
}

/**
 * VHD Sector allocation values
 * @enum {Number}
 */
VHD.SECTOR = {
  FREE: 0xFFFFFFFF,
}

// Enums
VHD.VERSION = require( './enum/version' )
VHD.ACCESS = require( './enum/access-mask' )
VHD.ATTACH = require( './enum/attach' )
VHD.COMPACT = require( './enum/compact' )
VHD.CREATE = require( './enum/create' )
VHD.DEPENDENCY = require( './enum/dependency' )
VHD.DETACH = require( './enum/detach' )
VHD.EXPAND = require( './enum/expand' )
VHD.GETINFO = require( './enum/get-info' )
VHD.MERGE = require( './enum/merge' )
VHD.MIRROR = require( './enum/mirror' )
VHD.OPEN = require( './enum/open' )
VHD.RESIZE = require( './enum/resize' )
VHD.SETINFO = require( './enum/set-info' )
VHD.STORAGE = require( './enum/storage' )
VHD.VENDOR = require( './enum/storage-vendor' )

// Parent Locator Structure
VHD.Locator = require( './locator' )
// Header Structure
VHD.Header = require( './header' )
// Hard Disk Footer (HDF) Structure
VHD.Footer = require( './footer' )

// VHD Image
VHD.Image = require( './image' )

VHD.ReadStream = require( './read-stream' )
VHD.WriteStream = require( './write-stream' )

/**
 * Calculate the checksum for a given buffer
 * The checksum is a oneʼs complement of the sum of all the bytes
 * in the structure without the checksum field
 * @param {Buffer} buffer
 * @param {Number} [offset=0]
 * @param {Number} [length=( buffer.length - offset )]
 * @returns {Number} checksum
 */
VHD.checksum = function( buffer, offset, length ) {

  offset = offset || 0
  length = length != null ? length :
    buffer.length - offset

  var sum = 0

  for( var i = 0; i < length; i++ ) {
    sum = ( sum + buffer[ offset + i ] )
  }

  return ~sum >>> 0

}

/**
 * Determine the disk geometry from the total number of sectors
 * @param {Number} totalSectors
 * @returns {Object} geometry
 * @see Virtual Hard Disk Image Format Specification, Appendix "CHS Calculation"
 */
VHD.getDiskGeometry = function( totalSectors ) {

  var cylinders = 0
  var heads = 0
  var sectors = 0

  // Clamp total number of sectors to the maximum
  // that can be represented by CHS addressing
  //                   C     H     S
  if( totalSectors > 65535 * 16 * 255 ) {
    totalSectors = 65535 * 16 * 255
  }

  if( totalSectors >= 65535 * 16 * 63 ) {

    sectors = 255
    heads = 16
    cylinders = totalSectors / sectors

  } else {

    sectors = 17
    cylinders = totalSectors / sectors
    heads = ( cylinders + 1023 ) / 1024

    if( heads < 4 ) {
      heads = 4
    }

    if( cylinders >= ( heads * 1024 ) || heads > 16 ) {
      sectors = 31
      heads = 16
      cylinders = totalSectors / sectors
    }

    if( cylinders >= ( heads * 1024 ) ) {
      sectors = 63
      heads = 16
      cylinders = totalSectors / sectors
    }

  }

  // Divide `cylinders` by `heads` here, as the intermediate
  // `cylinders` values do not have that factored out
  cylinders = cylinders / heads

  return { cylinders, heads, sectors }

}
