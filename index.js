var from = require('from2')
var fs = require('fs')
var path = require('path')

module.exports = walker

function walker (dirs, opts) {
  var filter = opts && opts.filter || function (filename) { return true }
  if (!Array.isArray(dirs)) dirs = [dirs]

  var pending = []

  dirs.map(function (dir) {
    dir = filter(dir) ? dir : null
    if (dir) pending.push(dir)
  })

  return from.obj(read)

  function read (size, cb) {
    if (!pending.length) return cb(null, null)
    var name = pending.shift()
    fs.lstat(name, function (err, st) {
      if (err) return done(err)
      if (!st.isDirectory()) return done(null, name)

      fs.readdir(name, function (err, files) {
        if (err) return done(err)
        files.sort()
        for (var i = 0; i < files.length; i++) {
          var next = path.join(name, files[i])
          if (filter(next)) pending.unshift(next)
        }
        done(null, name)
      })

      function done (err, dir) {
        if (err) return cb(err)
        cb(null, {
          basename: path.basename(name),
          relname: dir === name ? path.basename(name) : path.relative(dir, name),
          filepath: name,
          stat: st
        })
      }
    })
  }
}
