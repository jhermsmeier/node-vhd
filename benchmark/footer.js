var VHD = require( '..' )
var bench = require( 'nanobench' )
var fs = require( 'fs' )
var path = require( 'path' )

const ITERATIONS = 100000

bench( `new VHD.Footer() ⨉ ${ITERATIONS}`, function( run ) {

  var footer = new VHD.Footer()

  run.start()

  for( var i = 0; i < ITERATIONS; i++ ) {
    footer = new VHD.Footer()
  }

  run.end()

})

bench.skip( `VHD.Footer.parse( buffer ) ⨉ ${ITERATIONS}`, function( run ) {

  var filename = path.join( __dirname, '..', 'test', 'data', 'footer.bin' )
  var buffer = fs.readFileSync( filename )
  var footer = new VHD.Footer()

  run.start()

  for( var i = 0; i < ITERATIONS; i++ ) {
    footer = VHD.Footer.parse( buffer )
  }

  run.end()

})

bench( `VHD.Footer#parse( buffer ) ⨉ ${ITERATIONS}`, function( run ) {

  var filename = path.join( __dirname, '..', 'test', 'data', 'footer.bin' )
  var buffer = fs.readFileSync( filename )
  var footer = new VHD.Footer()

  run.start()

  for( var i = 0; i < ITERATIONS; i++ ) {
    footer.parse( buffer )
  }

  run.end()

})

bench( `VHD.Footer#write( buffer ) ⨉ ${ITERATIONS}`, function( run ) {

  var filename = path.join( __dirname, '..', 'test', 'data', 'footer.bin' )
  var buffer = fs.readFileSync( filename )
  var footer = VHD.Footer.parse( buffer )
  var copy = Buffer.alloc( VHD.Footer.SIZE )

  run.start()

  for( var i = 0; i < ITERATIONS; i++ ) {
    footer.write( copy )
  }

  run.end()

})

bench( `VHD.Footer#write() ⨉ ${ITERATIONS}`, function( run ) {

  var filename = path.join( __dirname, '..', 'test', 'data', 'footer.bin' )
  var buffer = fs.readFileSync( filename )
  var footer = VHD.Footer.parse( buffer )
  var copy = Buffer.alloc( VHD.Footer.SIZE )

  run.start()

  for( var i = 0; i < ITERATIONS; i++ ) {
    copy = footer.write()
  }

  run.end()

})
