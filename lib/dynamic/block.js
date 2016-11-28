/**
 * Data Sector
 * Default sector size is 2 MB, a sector
 * containing 4096 512 byte blocks
 * @constructor
 * @param {Buffer} value
 */
function Sector( value ) {

  if( !(this instanceof Sector) )
    return new Sector( value )

  /** @type {Number} Sector's size in bytes */
  this.size = 512 * 4096
  /** @type {Boolean} Whether the Sector is flagged as 'dirty' */
  this.dirty = false

  if( value instanceof Buffer ) {
    this.parse( value )
  }

}

/**
 * Data Sector Prototype
 * @type {Object}
 * @ignore
 */
Sector.prototype = {

  constructor: Sector,

  get dirty() {
    throw new Error( 'Not implemented' )
  },

  set dirty( value ) {
    throw new Error( 'Not implemented' )
  },

  parse: function( value ) {

    var buffer = ( value instanceof Buffer ) ?
      value : new Buffer( value )

    return this

  },

}

// Exports
module.exports = Sector
