var VHD = require( '..' )
var assert = require( 'assert' )
var path = require( 'path' )
var Disk = require( 'disk' )
var inspect = require( './inspect' )

suite( 'VHD.Fixed', function() {

  var filename = path.join( __dirname, 'data', 'fixed.vhd' )
  var blockDevice = null
  var disk = null

  test( 'init vhd', function() {
    blockDevice = new VHD.Fixed({
      path: filename,
    })
  })

  test( 'init disk', function() {
    disk = new Disk( blockDevice )
  })

  test( 'open disk', function( done ) {
    disk.open( function( error ) {
      // console.log( inspect( disk ) )
      assert.ok( disk.mbr, 'Missing MBR' )
      assert.equal( disk.mbr.partitions.length, 4, 'Unexpected partition count' )
      done( error )
    })
  })

  test( 'read partition (~32MB)', function( done ) {
    var part = disk.mbr.partitions[0]
    disk.device.readBlocks( part.firstLBA, part.lastLBA, function( error, buffer, bytesRead ) {
      assert.equal( disk.device.blockSize * (part.lastLBA - part.firstLBA), bytesRead, 'Bytes read mismatch' )
      done( error )
    })
  })

  test( 'close disk', function( done ) {
    disk.close( function( error ) {
      done( error )
    })
  })

})

