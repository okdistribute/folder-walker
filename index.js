var fs = require('fs')
var from = require('from2')
var through = require('through2')
var path = require('path')
var pump = require('pump')
var stream = require('readable-stream')
var util = require('util')

module.exports = Walker

function Walker (dir, opts) {
  var self = this
  if (!(this instanceof Walker)) return new Walker(dir, opts)
  if (!opts) opts = {}
  self._dir = dir
  self._want = true
  stream.Readable.call(this, {objectMode: true, highWaterMark: 16})
  self.filter = opts.filter || function (filename) { return true }
}

util.inherits(Walker, stream.Readable)

Walker.prototype._read = function () {
  var self = this
  if (!self._want) return
  self._want = false
  fs.stat(self._dir, function (err, st) {
    if (err) return self.emit('error', err)
    if (!st.isDirectory()) return self._onfile(self._dir, done)
    self._walk(self._dir, done)
  })

  function done (err) {
    if (err) return self.emit('error', err)
    self._end()
  }
}

Walker.prototype._walk = function (dir, cb) {
  var self = this
  fs.readdir(dir, function (err, files) {
    if (err) return cb(err)
    var walk = through.obj(function (data, enc, next) {
      self._onfile(path.join(dir, data), next)
    })
    pump(from.obj(files.sort()), walk, cb)
  })
}

Walker.prototype._onfile = function (filepath, cb) {
  var self = this
  if (!this.filter(filepath)) return cb()
  fs.lstat(filepath, function (err, stat) {
    if (err) return cb(err)
    self.push({
      basename: path.basename(filepath),
      relname: self._dir === filepath ? path.basename(filepath) : path.relative(self._dir, filepath),
      filepath: filepath,
      stat: stat
    })
    if (stat.isDirectory()) return self._walk(filepath, cb)
    return cb()
  })
}

Walker.prototype._end = function () {
  this.push(null)
}
