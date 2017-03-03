var VHD = module.exports

/**
 * The VHD's epoch is defined as
 * 2000-01-01T00:00:00.000Z
 * @type {Number}
 */
VHD.EPOCH = 946684800000

/**
 * Minimum size of a VHD image;
 * All disk types have a minimum size of 3 MB.
 * 3 * 1024 * 1024
 * @type {Number}
 */
VHD.MIN_SIZE = 3145728

/**
 * Default VHD block size
 * @type {Number}
 */
VHD.BLOCK_SIZE = 512

/**
 * Default sector size is 2 MB,
 * a sector containing 4096 512 byte blocks
 * @type {Number}
 */
VHD.SECTOR_SIZE = VHD.BLOCK_SIZE * 4096

/**
 * Size of the VHD header structure in bytes
 * @type {Number}
 */
VHD.HEADER_SIZE = 1024

/**
 * Size of the VHD footer structure in bytes
 * @type {Number}
 */
VHD.FOOTER_SIZE = 512

/**
 * Host OS magic numbers
 * Also see Locator.PLATFORM
 * @type {Object}
 */
VHD.HOST_OS = {
  WINDOWS: 0x5769326B,
  MACINTOSH: 0x4D616320,
}

/**
 * [FEATURES description]
 * @type {Object}
 */
VHD.FEATURES = {
  NONE:       0x00000000,
  TEMPORARY:  0x00000001,
  RESERVED:   0x00000002,
}

/**
 * VHD Image type
 * @type {Object}
 */
VHD.TYPE = {
  NONE: 0,
  // RESERVED_(DEPRECATED): 1
  FIXED: 2,
  DYNAMIC: 3,
  DIFFERENCING: 4,
  // RESERVED_(DEPRECATED): 5
  // RESERVED_(DEPRECATED): 6
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

// Version conversion
VHD.Version = require( './version' )
// Block Allocation Table
VHD.AllocationTable = require( './alloc-table' )
// Parent Locator Structure
VHD.Locator = require( './locator' )
// Header Structure
VHD.Header = require( './header' )
// Hard Disk Footer (HDF) Structure
VHD.Footer = require( './footer' )

// Fixed VHD Image
VHD.Fixed = require( './fixed' )
// Dynamic VHD Image
VHD.Dynamic = require( './dynamic' )
