var VHD = require( '..' )
var assert = require( 'assert' )
var path = require( 'path' )
var MBR = require( 'mbr' )
var inspect = require( './inspect' )

describe( 'VHD.Fixed', function() {

  var filename = path.join( __dirname, 'data', 'fixed.vhd' )
  var image = null

  specify( 'init vhd', function() {
    image = new VHD.Image({
      path: filename,
    })
  })

  specify( 'open image', function( done ) {
    image.open( function( error ) {
      // inspect.log( image )
      done( error )
    })
  })

  specify( 'read partition (~32MB)', function( done ) {

    var buffer = Buffer.allocUnsafe( 512 )

    image.read( buffer, 0, 512, 0, function( error, bytesRead, buffer ) {
      if( error ) return done( error )
      var mbr = MBR.parse( buffer )
      var part = mbr.partitions[0]
      var length = VHD.BLOCK_SIZE * ( part.lastLBA - part.firstLBA )
      var partBuffer = Buffer.alloc( length )
      image.read( partBuffer, 0, length, part.firstLBA * VHD.BLOCK_SIZE, function( error, bytesRead, buffer ) {
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

  specify( 'close image', function( done ) {
    image.close( function( error ) {
      done( error )
    })
  })

})

