/**
 * VHD Constructor
 * @param {Object} options
 */
function VHD( options ) {
  
  if( !(this instanceof VHD) )
    return new VHD( options )
  
}

// Exports
module.exports = VHD

/**
 * VHD Enumerations
 * @type {Object}
 */
require( './enum' )

/**
 * VHD Prototype
 * @type {Object}
 */
VHD.prototype = {
  
  constructor: VHD,
  
}
