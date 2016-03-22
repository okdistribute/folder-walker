var from = require('from2')
var fs = require('fs')
var path = require('path')
var Ignore = require('ignore')

module.exports = walker

function walker (dirs, opts) {
  var filter = function () { return true }, 
  hook = function (directory, files, cb) { 
    cb(files.map(function (file) { 
      return path.join(directory, file)
    })) 
  }, 
  ignore = [];

  if (!Array.isArray(dirs) && typeof dirs === 'object') {
    opts = dirs
    dirs = ['.']
  } else {
    dirs = [].concat(dirs || ['.'])
  }

  if (opts && typeof opts.filter === 'function') filter = opts.filter;
  if (opts && typeof opts.hook === 'function') hook = opts.hook;
  if (opts && opts.ignore) ignore = ignore.concat(opts.ignore || []);

  dirs = dirs.filter(filter)

  var pending = []
  var root = dirs.shift()
  if (root) pending.push(root)

  return from.obj(read)

  function read (size, next) {
    if (!pending.length) {
      if (dirs.length) {
        root = dirs.shift()
        pending.push(root)
        return read(size, next)
      }
      return next(null, null)
    }
    var name = pending.shift()
    fs.lstat(name, function (err, st) {
      if (err) return done(err)
      if (!st.isDirectory()) return done(null)

      fs.readdir(name, function (err, files) {
        if (err) return done(err)

        // pre-filter global ignore parameters

        files = files
        .sort()
        .filter(Ignore().add(ignore).createFilter())
        .filter(filter)

        hook(name, files, function next (filtered) {
          pending = filtered.concat(pending)
          done(null)
        })

      })

      function done (err) {
        if (err) return next(err)
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
        next(null, item)
      }
    })
  }
}