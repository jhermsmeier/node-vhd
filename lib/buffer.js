var buffer = module.exports
var hasBigIntMethods = typeof Buffer.prototype.readBigUInt64BE == 'function'

if( hasBigIntMethods ) {

  buffer.readBigUInt64BE = function( buffer, offset ) {
    return buffer.readBigUInt64BE( offset )
  }

  buffer.writeBigUInt64BE = function( buffer, value, offset ) {
    return buffer.writeBigUInt64BE( value, offset )
  }

  buffer.readBigUInt64LE = function( buffer, offset ) {
    return buffer.readBigUInt64LE( offset )
  }

  buffer.writeBigUInt64LE = function( buffer, value, offset ) {
    return buffer.writeBigUInt64LE( value, offset )
  }

} else {

  buffer.readBigUInt64BE = function( buffer, offset ) {
    offset = offset || 0
    var hi = buffer.readUInt32BE( offset )
    var lo = buffer.readUInt32BE( offset + 4 )
    return ( BigInt( hi ) << BigInt( 32 ) ) + BigInt( lo )
  }

  buffer.writeBigUInt64BE = function( buffer, value, offset ) {
    offset = offset || 0
    var hi = BigInt( value ) >> BigInt( 32 )
    var lo = BigInt( value ) - ( hi << BigInt( 32 ) )
    buffer.writeUInt32BE( Number( hi ), offset )
    buffer.writeUInt32BE( Number( lo ), offset + 4 )
    return offset + 8
  }

  buffer.readBigUInt64LE = function( buffer, offset ) {
    offset = offset || 0
    var hi = buffer.readUInt32LE( offset + 4 )
    var lo = buffer.readUInt32LE( offset )
    return ( BigInt( hi ) << BigInt( 32 ) ) + BigInt( lo )
  }

  buffer.writeBigUInt64LE = function( buffer, value, offset ) {
    offset = offset || 0
    var hi = BigInt( value ) >> BigInt( 32 )
    var lo = BigInt( value ) - ( hi << BigInt( 32 ) )
    buffer.writeUInt32LE( Number( hi ), offset + 4 )
    buffer.writeUInt32LE( Number( lo ), offset )
    return offset + 8
  }

}
