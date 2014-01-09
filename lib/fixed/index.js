var VHD = require( '../vhd' )

/**
 * Fixed Disk Constructor
 * @param {Object} options
 */
function Fixed( options ) {
  
  if( !(this instanceof Fixed) )
    return new Fixed( options )
  
}

// Exports
module.exports = Fixed

/**
 * Fixed Disk Prototype
 * @type {Object}
 */
Fixed.prototype = {
  
  constructor: Fixed,
  
}
