var VHD = require( '..' )
var assert = require( 'assert' )
var path = require( 'path' )
var Disk = require( 'disk' )
var inspect = require( './inspect' )

describe( 'VHD.Dynamic', function() {

  var filename = path.join( __dirname, 'data', 'dynamic.vhd' )
  var blockDevice = null
  var disk = null

  specify( 'init vhd', function() {
    blockDevice = new VHD.Dynamic({
      path: filename,
    })
  })

  specify( 'init disk', function() {
    disk = new Disk( blockDevice )
  })

  specify( 'open disk', function( done ) {
    disk.open( function( error ) {
      // console.log( inspect( disk ) )
      assert.ok( disk.mbr, 'Missing MBR' )
      assert.ok( disk.gpt, 'Missing GPT' )
      assert.deepEqual( disk.getEFIPart(), disk.mbr.partitions[0], 'EFI partition mismatch' )
      assert.equal( disk.gpt.partitions.length, 4, 'Unexpected partition count' )
      done( error )
    })
  })

  specify( 'read partition (~32MB)', function( done ) {
    var part = disk.gpt.partitions[0]
    disk.device.readBlocks( part.firstLBA, part.lastLBA, function( error, buffer, bytesRead ) {
      assert.equal( disk.device.blockSize * (part.lastLBA - part.firstLBA), bytesRead, 'Bytes read mismatch' )
      done( error )
    })
  })

  specify( 'close disk', function( done ) {
    disk.close( function( error ) {
      done( error )
    })
  })

})
