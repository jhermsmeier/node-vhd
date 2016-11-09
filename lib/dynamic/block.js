/**
 * Data Block Constructor
 * @param {Buffer} value
 */
function Block( value ) {

  if( !(this instanceof Block) )
    return new Block( value )

  // Default block size is 2 MB,
  // containing 4096 512 byte sectors
  this.size = 512 * 4096
  this.dirty = false

  if( value instanceof Buffer ) {
    this.parse( value )
  }

}

/**
 * Data Block Prototype
 * @type {Object}
 */
Block.prototype = {

  constructor: Block,

  get dirty() {

  },

  set dirty( value ) {

  },

  parse: function( value ) {

    var buffer = ( value instanceof Buffer ) ?
      value : new Buffer( value )

    return this

  }

}

// Exports
module.exports = Block
