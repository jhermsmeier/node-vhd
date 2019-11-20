var VHD = require( '..' )
var bench = require( 'nanobench' )
var fs = require( 'fs' )
var path = require( 'path' )

const ITERATIONS = 100000

bench( `new VHD.Header() ⨉ ${ITERATIONS}`, function( run ) {

  var footer = new VHD.Header()

  run.start()

  for( var i = 0; i < ITERATIONS; i++ ) {
    footer = new VHD.Header()
  }

  run.end()

})

bench.skip( `VHD.Header.parse( buffer ) ⨉ ${ITERATIONS}`, function( run ) {

  var filename = path.join( __dirname, '..', 'test', 'data', 'header.bin' )
  var buffer = fs.readFileSync( filename )
  var footer = new VHD.Header()

  run.start()

  for( var i = 0; i < ITERATIONS; i++ ) {
    footer = VHD.Header.parse( buffer, 512 )
  }

  run.end()

})

bench( `VHD.Header#parse( buffer ) ⨉ ${ITERATIONS}`, function( run ) {

  var filename = path.join( __dirname, '..', 'test', 'data', 'header.bin' )
  var buffer = fs.readFileSync( filename )
  var header = new VHD.Header()

  run.start()

  for( var i = 0; i < ITERATIONS; i++ ) {
    header.parse( buffer, 512 )
  }

  run.end()

})

bench( `VHD.Header#write( buffer ) ⨉ ${ITERATIONS}`, function( run ) {

  var filename = path.join( __dirname, '..', 'test', 'data', 'header.bin' )
  var buffer = fs.readFileSync( filename )
  var footer = VHD.Header.parse( buffer, 512 )
  var copy = Buffer.alloc( VHD.Header.SIZE )

  run.start()

  for( var i = 0; i < ITERATIONS; i++ ) {
    footer.write( copy )
  }

  run.end()

})

bench( `VHD.Header#write() ⨉ ${ITERATIONS}`, function( run ) {

  var filename = path.join( __dirname, '..', 'test', 'data', 'header.bin' )
  var buffer = fs.readFileSync( filename )
  var footer = VHD.Header.parse( buffer, 512 )
  var copy = Buffer.alloc( VHD.Header.SIZE )

  run.start()

  for( var i = 0; i < ITERATIONS; i++ ) {
    copy = footer.write()
  }

  run.end()

})
