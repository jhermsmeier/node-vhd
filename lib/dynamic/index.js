var VHD = require( '../vhd' )
var File = require( 'fabl' )

/**
 * Dynamic Disk Constructor
 * @param {Object} options
 */
function Dynamic( options ) {
  
  if( !(this instanceof Dynamic) )
    return new Dynamic( options )
  
  this.path = options.path
  
}

// Exports
module.exports = Dynamic

// Dynamic Disk Header Format (DDHF)
Dynamic.Header = require( './header' )

/**
 * Dynamic Disk Prototype
 * @type {Object}
 */
Dynamic.prototype = {
  
  constructor: Dynamic,
  
}
