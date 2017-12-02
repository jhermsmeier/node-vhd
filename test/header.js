var fs = require( 'fs' )
var path = require( 'path' )
var assert = require( 'assert' )
var inspect = require( './inspect' )
var VHD = require( '..' )

function print( label, buffer ) {
  var hex = require( 'hex' )
  console.log( label )
  console.log( '' )
  hex( buffer )
  console.log( '' )
}

describe( 'VHD.Header', function() {

  var filename = path.join( __dirname, 'data', 'header.bin' )
  var buffer = fs.readFileSync( filename ).slice( 512 )

  assert.equal( buffer.length, VHD.Header.SIZE, `Invalid header buffer size: ${buffer.length}` )

  specify( '.parse()', function() {
    var header = VHD.Header.parse( buffer )
  })

  specify( '.write()', function() {

    var expected = Buffer.from( buffer )
    var actual = VHD.Header.parse( buffer ).write()

    // print( 'expected', expected )
    // print( 'actual', actual )

    assert.deepEqual( VHD.Header.parse( expected ), VHD.Header.parse( actual ) )
    assert.deepEqual( expected, actual )

  })

})
