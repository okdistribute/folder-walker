var test = require('tape')
var path = require('path')
var walker = require('./')

test('test data stream', function (t) {
  var stream = walker(process.cwd())

  stream.on('data', function (data) {
  })

  stream.on('error', function (err) {
    t.ifError(err)
  })

  stream.on('end', function () {
    t.end()
  })
})

test('test multiple folders', function (t) {
  var stream = walker([process.cwd(), path.join(__dirname, 'fixtures')],
    { filter: function filter (filepath) {
      return filepath.indexOf('.git') === -1
    }})

  stream.on('data', function (data) {
    t.ok(data.filepath)
  })

  stream.on('error', function (err) {
    t.ifError(err)
  })

  stream.on('end', function () {
    t.end()
  })
})

test('test data stream with only a file', function (t) {
  var stream = walker(__filename)
  t.plan(1)

  stream.on('data', function (data) {
    t.same(data.filepath, __filename)
  })

  stream.on('error', function (err) {
    t.ifError(err)
  })

  stream.on('end', function () {
    t.end()
  })
})

test('test data stream with filter', function (t) {
  function filter (filepath) {
    return false
  }

  var stream = walker(process.cwd(), {filter: filter})

  var times = 0
  stream.on('data', function (data) {
    times += 1
  })

  stream.on('error', function (err) {
    t.ifError(err)
  })

  stream.on('end', function () {
    t.same(times, 0)
    t.end()
  })
})

test('test data stream filtering out .git', function (t) {
  function filter (filepath) {
    return filepath.indexOf('.git') === -1
  }

  var stream = walker(process.cwd(), {filter: filter})

  stream.on('data', function (data) {
    t.equal(data.filepath.indexOf('.git'), -1)
    t.ok(data.stat, 'has stat')
    t.ok(data.root, 'has root')
    t.ok(data.relname)
    t.ok(data.filepath)
    t.ok(data.basename)
  })

  stream.on('error', function (err) {
    t.ifError(err)
  })

  stream.on('end', function () {
    t.end()
  })
})
