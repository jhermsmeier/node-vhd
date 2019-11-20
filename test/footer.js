var fs = require( 'fs' )
var path = require( 'path' )
var assert = require( 'assert' )
var inspect = require( './inspect' )
var VHD = require( '..' )

describe( 'VHD.Footer', function() {

  var filename = path.join( __dirname, 'data', 'footer.bin' )
  var buffer = fs.readFileSync( filename )

  specify( '.parse()', function() {

    var footer = VHD.Footer.parse( buffer )

    assert.equal( footer.signature, 'conectix' )
    assert.equal( footer.features, 2 )
    assert.deepEqual( footer.formatVersion, { major: 1, minor: 0 } )
    assert.equal( footer.dataOffset, 0xFFFFFFFFFFFFFFFFn )
    assert.equal( footer.timestamp, 1497999491000 )
    assert.equal( footer.creatorApplication, 'win ' )
    assert.deepEqual( footer.creatorVersion, { major: 10, minor: 0 } )
    assert.equal( footer.creatorHostOS, 1466511979 )
    assert.equal( footer.originalSize, 10485760 )
    assert.equal( footer.currentSize, 10485760 )
    assert.deepEqual( footer.diskGeometry, { cylinders: 301, heads: 4, sectors: 17 } )
    assert.equal( footer.diskType, 2 )
    assert.equal( footer.checksum, 4294960592 )
    assert.equal( footer.uuid.toString( 'hex' ), '71a5d438d9d5f44b8d26726a7e7ef18e' )
    assert.equal( footer.savedState, 0 )
    // assert.equal( footer.reserved, <Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ... > )

  })

  specify( '.write()', function() {

    var expected = Buffer.from( buffer )
    var actual = VHD.Footer.parse( buffer ).write()

    assert.strictEqual( Buffer.compare( expected, actual ), 0 )

  })

})
