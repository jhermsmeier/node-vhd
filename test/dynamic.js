var VHD = require( '..' )
var assert = require( 'assert' )
var path = require( 'path' )
var MBR = require( 'mbr' )
var inspect = require( './inspect' )

describe( 'VHD.Dynamic', function() {

  var filename = path.join( __dirname, 'data', 'dynamic.vhd' )
  var image = null

  specify( 'open image', function( done ) {
    image = new VHD.Image({ path: filename })
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

      var offset = 0
      var length = 1 * ( 1024 ** 2 )
      var position = part.firstLBA * VHD.BLOCK_SIZE
      var buffer = Buffer.alloc( length )

      image.read( buffer, offset, length, position, function( error, bytesRead, buffer ) {
        if( error ) return done( error )
        assert.equal( length, bytesRead, 'Bytes read mismatch' )
        done( error )
      })

    })

  })

  specify( 'readStream', function( done ) {
    image.createReadStream()
      .on( 'error', done )
      .on( 'end', function() {
        assert.equal( this.bytesRead, Number( image.footer.currentSize ) )
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
