function Version( value ) {

  if( !(this instanceof Version) )
    return new Version( value )

  this.major = 0
  this.minor = 0

  if( value != null ) {
    this.parse( value )
  }

}

Version.fromBuffer = function( buffer ) {
  return new Version.parse( buffer )
}

Version.fromString = function( str ) {
  return new Version.parse( str )
}

Version.toString = function( buffer ) {
  var major = buffer.readUInt16BE( 0 )
  var minor = buffer.readUInt16BE( 2 )
  return major + '.' + minor
}

Version.toBuffer = function( str ) {
  var buffer = new Buffer( 4 )
  var version = str.split( '.' )
  buffer.writeUInt16BE( version[0], 0 )
  buffer.writeUInt16BE( version[1], 2 )
  return buffer
}

Version.prototype = {

  constructor: Version,

  parse: function( value ) {

    if( value instanceof Buffer ) {
      this.major = value.readUInt16BE( 0 )
      this.minor = value.readUInt16BE( 2 )
    } else {
      var version = ( value + '' ).split( '.' )
      this.major = version[0]
      this.minor = version[1]
    }

    return this

  },

  toBuffer: function() {
    var buffer = new Buffer( 4 )
    buffer.writeUInt16BE( this.major, 0 )
    buffer.writeUInt16BE( this.minor, 2 )
    return buffer
  },

  toJSON: function() {
    return this.toString()
  },

  toString: function() {
    return this.major + '.' + this.minor
  },

  valueOf: function() {
    return this.toString()
  },

}

module.exports = Version
