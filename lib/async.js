var async = module.exports

/**
 * Run a list of asynchronous tasks in series
 * @param {Array<Function>} list
 * @param {Function} callback
 * @returns {undefined}
 */
async.series = ( list, callback ) => {

  var tasks = list.slice()

  var run = ( error ) => {
    var task = tasks.shift()
    error || task == null ?
      callback( error ) :
      task( run )
  }

  run()

}

async.whilst = ( condition, fn, callback ) => {

  var run = ( error ) => {
    if( !error && condition() ) {
      fn( run )
    } else {
      callback( error )
    }
  }

  run()

}
