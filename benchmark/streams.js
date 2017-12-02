var VHD = require( '..' )
var bench = require( 'nanobench' )
var fs = require( 'fs' )
var path = require( 'path' )

bench( `VHD.Fixed.ReadStream`, function( run ) {

  var filename = path.join( __dirname, '..', 'test', 'data', 'fixed.vhd' )
  var readStream = VHD.Fixed.createReadStream( filename )

  run.start()

  readStream.resume()
    .on( 'end', function() {
      run.end()
    })

})

bench( `VHD.Dynamic.ReadStream`, function( run ) {

  var filename = path.join( __dirname, '..', 'test', 'data', 'dynamic.vhd' )
  var readStream = VHD.Dynamic.createReadStream( filename )

  run.start()

  readStream.resume()
    .on( 'end', function() {
      run.end()
    })

})

// TODO: Not implemented
bench.skip( `VHD.Dynamic.SparseReadStream`, function( run ) {

  var filename = path.join( __dirname, '..', 'test', 'data', 'dynamic.vhd' )
  var readStream = VHD.Dynamic.createSparseReadStream( filename )

  run.start()

  readStream.resume()
    .on( 'end', function() {
      run.end()
    })

})
