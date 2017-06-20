var VHD = require( '..' )
var assert = require( 'assert' )
var path = require( 'path' )
var Disk = require( 'disk' )
var inspect = require( './inspect' )

suite( 'VHD.Dynamic', function() {

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
      // console.log( inspect( disk ) )
      assert.ok( disk.mbr, 'Missing MBR' )
      assert.ok( disk.gpt, 'Missing GPT' )
      assert.ok( disk.getEFIPart(), disk.mbr.partitions[0], 'EFI partition mismatch' )
      assert.equal( disk.gpt.partitions.length, 4, 'Unexpected partition count' )
      done( error )
    })
  })

  test( 'read partition (~32MB)', function( done ) {
    var part = disk.gpt.partitions[0]
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
