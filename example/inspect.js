var argv = process.argv.slice( 2 )
var VHD = require( '..' )
var inspect = require( '../test/inspect' )

var filename = argv.shift()

var image = new VHD.Image({ path: filename })

image.open(( error ) => {

  error && console.error( error )

  inspect.log( image )

  image.close(( error ) => {
    error && console.error( error )
  })

})
