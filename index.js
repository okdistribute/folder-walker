var from = require('from2')
var fs = require('fs')
var path = require('path')
var Ignore = require('ignore')

module.exports = walker

function walker (dirs, opts) {
  var filter, ignoreFiles = [], ignore = [];

  filter = opts && opts.filter || function (filename) { return true }
  if (opts && opts.ignoreFiles) ignoreFiles = ignoreFiles.concat(opts.ignoreFiles);
  if (opts && opts.ignore) ignore = ignore.concat(opts.ignore || []);

  if (!Array.isArray(dirs)) dirs = [dirs]
  dirs = dirs.filter(filter)

  var pending = []
  var root = dirs.shift()
  if (root) pending.push(root)

  return from.obj(read)

  function read (size, cb) {
    if (!pending.length) {
      if (dirs.length) {
        root = dirs.shift()
        pending.push(root)
        return read(size, cb)
      }
      return cb(null, null)
    }
    var name = pending.shift()
    fs.lstat(name, function (err, st) {
      if (err) return done(err)
      if (!st.isDirectory()) return done(null)

      fs.readdir(name, function (err, files) {
        if (err) return done(err)
        files.sort()

        // get rules from ignore files for this tree. todo: asynchronize, so that multiple ignoreFiles can load at once.
        for (var i = ignoreFiles.length - 1; i >= 0; i--) {
          var ignoreFile = ignoreFiles[i]
          var index = files.indexOf(ignoreFile)
          if (index !== -1) {
            var full = path.join(name, files[index])
            ignore = ignore.concat(fs.readFileSync(full, { encoding: 'utf-8' }).trim().split('\n'))
          }
        }

        var ig = Ignore().add(ignore)

        pending = files
        .map(function(file) { return path.relative(process.cwd(), path.join(name, file)) })
        .filter(function (file) { return filter(file) })
        .filter(ig.createFilter())
        .concat(pending)

        done(null)
      })

      function done (err) {
        if (err) return cb(err)
        var item = {
          root: root,
          filepath: name,
          stat: st,
          relname: root === name ? path.basename(name) : path.relative(root, name),
          basename: path.basename(name)
        }
        var isFile = st.isFile()
        if (isFile) {
          item.type = 'file'
        }
        var isDir = st.isDirectory()
        if (isDir) item.type = 'directory'
        cb(null, item)
      }
    })
  }
}
