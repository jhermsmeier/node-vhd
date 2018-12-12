var VHD = require( '..' )
var assert = require( 'assert' )
var path = require( 'path' )
var MBR = require( 'mbr' )
var inspect = require( './inspect' )

describe( 'VHD.Dynamic', function() {

  var filename = path.join( __dirname, 'data', 'dynamic.vhd' )
  var image = null

  specify( 'init vhd', function() {
    image = new VHD.Image({
      path: filename,
    })
  })

  specify( 'open image', function( done ) {
    image.open( function( error ) {
      done( error )
    })
  })

  specify( 'read partition (~32MB)', function( done ) {

    var buffer = Buffer.allocUnsafe( 512 )

    image.read( buffer, 0, 512, 0, function( error, bytesRead, buffer ) {
      if( error ) return done( error )
      var mbr = MBR.parse( buffer )
      var part = mbr.partitions[0]
      image.readBlocks( part.firstLBA, part.lastLBA, function( error, bytesRead, buffer ) {
        assert.equal( VHD.BLOCK_SIZE * ( part.lastLBA - part.firstLBA ), bytesRead, 'Bytes read mismatch' )
        done( error )
      })
    })

  })

  specify( 'readStream', function( done ) {
    image.createReadStream()
      .on( 'error', done )
      .on( 'end', function() {
        assert.equal( this.bytesRead, image.footer.currentSize )
        done()
      })
      .resume()
  })

  specify.skip( 'sparseReadStream', function( done ) {
    image.createSparseReadStream()
      .on( 'error', done )
      .on( 'end', done )
      .on( 'data', function( chunk ) {
        console.log( chunk.length, chunk )
      })
  })

  specify( 'close image', function( done ) {
    image.close( function( error ) {
      done( error )
    })
  })

})
