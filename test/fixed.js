var VHD = require( '..' )
var assert = require( 'assert' )
var path = require( 'path' )
var Disk = require( 'disk' )
var inspect = require( './inspect' )

describe( 'VHD.Fixed', function() {

  var filename = path.join( __dirname, 'data', 'fixed.vhd' )
  var blockDevice = null
  var disk = null

  specify( 'init vhd', function() {
    blockDevice = new VHD.Fixed({
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
      assert.equal( disk.mbr.partitions.length, 4, 'Unexpected partition count' )
      done( error )
    })
  })

  specify( 'read partition (~32MB)', function( done ) {
    var part = disk.mbr.partitions[0]
    disk.device.readBlocks( part.firstLBA, part.lastLBA, function( error, buffer, bytesRead ) {
      assert.equal( disk.device.blockSize * (part.lastLBA - part.firstLBA), bytesRead, 'Bytes read mismatch' )
      done( error )
    })
  })

  specify( 'readStream', function( done ) {
    blockDevice.createReadStream()
      .on( 'error', done )
      .on( 'end', function() {
        assert.equal( this.bytesRead, blockDevice.footer.currentSize )
        done()
      })
      .resume()
  })

  specify( 'close disk', function( done ) {
    disk.close( function( error ) {
      done( error )
    })
  })

})

