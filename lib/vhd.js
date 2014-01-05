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
 * VHD Prototype
 * @type {Object}
 */
VHD.prototype = {
  
  constructor: VHD,
  
}
