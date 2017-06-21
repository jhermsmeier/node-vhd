var fs = require( 'fs' )
var path = require( 'path' )
var zlib = require( 'zlib' )
var VHD = require( '..' )

var images = [ 'dynamic.vhd', 'fixed.vhd' ]

images.forEach( function( image ) {
  before( `decompress ${image}`, function( done ) {
    var filename = path.join( __dirname, 'data', image )
    fs.createReadStream( filename + '.gz' )
      .pipe( zlib.createGunzip() )
      .pipe( fs.createWriteStream( filename ) )
      .once( 'error', done )
      .once( 'finish', done )
  })
})
