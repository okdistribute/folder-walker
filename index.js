var from = require('from2')
var fs = require('fs')
var path = require('path')

module.exports = walker

function walker (dir, opts) {
  var filter = opts && opts.filter || function (filename) { return true }
  var pending = filter(dir) ? [dir] : []

  return from.obj(read)

  function read (size, cb) {
    if (!pending.length) return cb(null, null)

    var name = pending.shift()
    fs.lstat(name, function (err, st) {
      if (err) return done(err)
      if (!st.isDirectory()) return done(null)

      fs.readdir(name, function (err, files) {
        if (err) return done(err)
        files.sort()
        for (var i = 0; i < files.length; i++) {
          var next = path.join(name, files[i])
          if (filter(next)) pending.unshift(next)
        }
        done(null)
      })

      function done (err) {
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
