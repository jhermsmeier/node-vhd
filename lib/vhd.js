/**
 * VHD Constructor
 * @param {Object} options
 */
function VHD( options ) {
  
  if( !(this instanceof VHD) )
    return new VHD( options )
  
}

// Load VHD Enumerations
require( './enum' )

// Seriously. They start counting here.
VHD.EPOCH = new Date(
  'January 1, 2000 12:00:00 AM GMT'
).getTime()

// Version conversion
VHD.Version = require( './version' )
// Hard Disk Footer (HDF) Structure
VHD.Footer = require( './footer' )
// Fixed VHD Image
VHD.Fixed = require( './fixed' )
// Dynamic VHD Image
VHD.Dynamic = require( './dynamic' )

/**
 * VHD Prototype
 * @type {Object}
 */
VHD.prototype = {
  
  constructor: VHD,
  
}

// Exports
module.exports = VHD
