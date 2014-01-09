function Version( value ) {
  
  if( !(this instanceof Version) )
    return new Version( value )
  
  throw new TypeError( 'Illegal constructor' )
  
}

module.exports = Version

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
  
}
