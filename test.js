var glob = require('glob')
var path = require('path')
var jsDir = path.resolve(__dirname, 'src/view')
var entryFiles = glob.sync(jsDir + '/!(*.*)')
entryFiles.forEach((filePath) => {
  console.log(filePath);
  // let filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'))
  // map[filename] = filePath
})