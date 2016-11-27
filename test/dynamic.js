var fs = require( 'fs' )
var path = require( 'path' )
var util = require( 'util' )
var VHD = require( '..' )

function inspect( value ) {
  return util.inspect( value, {
    colors: true,
    depth: null,
  })
}

suite( 'Dynamic VHD', function() {

  var disk = null
  var filename = path.join( __dirname, 'data', 'dynamic.vhd' )

  test( 'constructor', function() {
    disk = new VHD.Dynamic({
      path: filename
    })
  })

  test( 'open', function( done ) {
    disk.open( function( error ) {
      console.log( inspect( disk ) )
      done( error )
    })
  })

  test( 'close', function( done ) {
    disk.close( function( error ) {
      done( error )
    })
  })

})
