/**
 * Version
 * @constructor
 * @memberOf VHD
 * @param {Buffer|String} value
 * @returns {Version}
 */
function Version( value ) {

  if( !(this instanceof Version) ) {
    return new Version( value )
  }

  this.major = 0
  this.minor = 0

  if( typeof value === 'string' ) {
    this.fromString( value )
  } else if( Buffer.isBuffer( value ) ) {
    this.parse( value )
  }

}

/**
 * Version size in bytes
 * @const {Number}
 */
Version.SIZE = 4

/**
 * Parse a VHD version from a buffer
 * @param {Buffer} buffer
 * @param {Object} [offset=0]
 * @returns {Version}
 */
Version.parse = function( buffer, offset ) {
  return new Version().parse( buffer, offset )
}

/**
 * Parse a version from a string
 * @param {String} value
 * @return {Version}
 */
Version.fromString = function( value ) {
  return new Version().fromString( value )
}

/**
 * Version prototype
 * @type {Object}
 * @ignore
 */
Version.prototype = {

  constructor: Version,

  /**
   * Parse a VHD version from a buffer
   * @param {Buffer} buffer
   * @param {Object} [offset=0]
   * @returns {Version}
   */
  parse( buffer, offset ) {

    offset = offset || 0

    this.major = buffer.readUInt16BE( offset + 0 )
    this.minor = buffer.readUInt16BE( offset + 2 )

    return this

  },

  /**
   * Write the Version to a given buffer
   * @param {Buffer} buffer
   * @param {Number} [offset=0]
   * @returns {Buffer}
   */
  write( buffer, offset ) {

    offset = offset || 0

    buffer.writeUInt16BE( this.major, offset + 0 )
    buffer.writeUInt16BE( this.minor, offset + 2 )

    return buffer

  },

  /**
   * Set the version from a string
   * @param {String} value
   * @return {Version}
   */
  fromString( value ) {

    var parts = ( value + '' ).split( '.' )

    this.major = parseInt( parts.shift(), 10 ) || 0
    this.minor = parseInt( parts.shift(), 10 ) || 0

    return this

  },

  /**
   * Create a buffer from the Version
   * @returns {Buffer}
   */
  toBuffer() {
    var buffer = Buffer.alloc( Version.SIZE, 0 )
    return this.write( buffer )
  },

  toJSON() {
    return this.toString()
  },

  toString() {
    return `${this.major}.${this.minor}`
  },

}

module.exports = Version
