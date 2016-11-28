/**
 * Data Block
 * Default block size is 2 MB, a block
 * containing 4096 512 byte sectors
 * @constructor
 * @param {Buffer} value
 */
function Block( value ) {

  if( !(this instanceof Block) )
    return new Block( value )

  /** @type {Number} Block's size in bytes */
  this.size = 512 * 4096
  /** @type {Boolean} Whether the block is flagged as 'dirty' */
  this.dirty = false

  if( value instanceof Buffer ) {
    this.parse( value )
  }

}

/**
 * Data Block Prototype
 * @type {Object}
 * @ignore
 */
Block.prototype = {

  constructor: Block,

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
module.exports = Block
