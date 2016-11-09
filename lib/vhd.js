var VHD = module.exports

// They start counting here.
// 'January 1, 2000 12:00:00 AM GMT'
VHD.EPOCH = 946684800000

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

// Hard Disk Footer (HDF) Structure
VHD.Footer = require( './footer' )
// Fixed VHD Image
VHD.Fixed = require( './fixed' )
// Dynamic VHD Image
VHD.Dynamic = require( './dynamic' )
