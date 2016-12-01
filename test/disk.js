var VHD = require( '..' )
var path = require( 'path' )
var util = require( 'util' )
var Disk = require( 'disk' )

function inspect( value ) {
  return util.inspect( value, {
    colors: true,
    depth: null,
  })
}

suite( 'Disk', function() {

  var filename = path.join( __dirname, 'data', 'dynamic.vhd' )
  var blockDevice = null
  var disk = null

  test( 'init vhd', function() {
    blockDevice = new VHD.Dynamic({
      path: filename,
    })
  })

  test( 'init disk', function() {
    disk = new Disk( blockDevice )
  })

  test( 'open disk', function( done ) {
    disk.open( function( error ) {
      console.log( inspect( disk ) )
      done( error )
    })
  })

  test( 'close disk', function( done ) {
    disk.close( function( error ) {
      done( error )
    })
  })

})
