var fs = require( 'fs' )
var path = require( 'path' )
var assert = require( 'assert' )
var inspect = require( './inspect' )
var VHD = require( '..' )

// function print( label, buffer ) {
//   var hex = require( 'hex' )
//   console.log( label )
//   console.log( '' )
//   hex( buffer )
//   console.log( '' )
// }

describe( 'VHD.Footer', function() {

  var filename = path.join( __dirname, 'data', 'footer.bin' )
  var buffer = fs.readFileSync( filename )

  specify( '.parse()', function() {

    var footer = VHD.Footer.parse( buffer )

    assert.equal( footer.cookie, 'conectix' )
    assert.equal( footer.features, 2 )
    assert.deepEqual( footer.fileFormatVersion, { major: 1, minor: 0 } )
    assert.equal( footer.dataOffset, 18446744073709552000 )
    assert.equal( footer.timestamp.getTime(), 1497999491000 )
    assert.equal( footer.creatorApplication, 'win ' )
    assert.deepEqual( footer.creatorVersion, { major: 10, minor: 0 } )
    assert.equal( footer.creatorHostOS, 1466511979 )
    assert.equal( footer.originalSize, 10485760 )
    assert.equal( footer.currentSize, 10485760 )
    assert.deepEqual( footer.diskGeometry, { cylinders: 301, heads: 4, sectors: 17 } )
    assert.equal( footer.diskType, 2 )
    assert.equal( footer.checksum, 4294960592 )
    assert.equal( footer.uniqueId.toString('hex'), '71a5d438d9d5f44b8d26726a7e7ef18e' )
    assert.equal( footer.savedState, 0 )
    // assert.equal( footer.reserved, <Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ... > )
    assert.equal( footer.isShort, false )

  })

  specify( '.write()', function() {

    var expected = Buffer.from( buffer )
    var actual = VHD.Footer.parse( buffer ).write()

    // print( 'expected', expected )
    // print( 'actual', actual )

    assert.deepEqual( VHD.Footer.parse( actual ), VHD.Footer.parse( expected ) )
    assert.deepEqual( actual, expected )

  })

})
