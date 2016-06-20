var test = require('tape')
var path = require('path')
var walker = require('./')

test('test multiple folders', function (t) {
  var stream = generateWalker(t, {path: [process.cwd(), path.join(__dirname, 'fixtures')]})

  stream.on('data', function (data) {
    t.ok(data.filepath)
  })
})

test('test data stream with only a file', function (t) {
  var stream = generateWalker(t, {path: __filename})
  t.plan(1)

  stream.on('data', function (data) {
    t.same(data.filepath, __filename)
  })

})

test('test data stream with filter', function (t) {
  function filter (filepath) {
    return false
  }

  var stream = generateWalker(t, {filter: filter})

  var times = 0
  stream.on('data', function (data) {
    times += 1
  })

  stream.on('end', function () {
    t.same(times, 0)
  })
})

test('test data stream filtering out .git', function (t) {
  var stream = generateWalker(t)

  stream.on('data', function (data) {
    t.equal(data.filepath.indexOf('.git'), -1)
    t.ok(data.stat, 'has stat')
    t.ok(data.root, 'has root')
    t.ok(data.relname)
    t.ok(data.filepath)
    t.ok(data.basename)
  })
})

function generateWalker (t, opts) {
  if (!opts) opts = {}
  function filter (filepath) {
    return filepath.indexOf('.git') === -1
  }
  var stream = walker(opts.path || process.cwd(), {filter: opts.filter || filter})

  stream.on('error', function (err) {
    t.ifError(err)
  })

  stream.on('end', function () {
    t.end()
  })
  return stream
}
