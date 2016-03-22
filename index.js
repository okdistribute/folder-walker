var from = require('from2')
var fs = require('fs')
var path = require('path')
var minimatch = require('minimatch')

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
        for (var i = 0; i < files.length; i++) {
          var next = path.join(name, files[i])
          var relative = path.relative(process.cwd(), next)
          var matches = ignore.filter(function (rule) {
            return minimatch(relative, rule, { matchBase: true, dot: true }) || minimatch('/'+relative, rule, { matchBase: true, dot: true })
          });
          if (filter(next) && matches.length == 0) pending.unshift(next)
        }
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
