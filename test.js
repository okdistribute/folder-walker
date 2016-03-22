var test = require('tape')
var path = require('path')
var ignore = require('ignore')
var fs = require('fs')
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

test('test data stream with ignore rule', function (t) {
  var stream = walker(path.join(__dirname, 'fixtures'), { ignore: 'ignoremetoo' })

  stream.on('data', function (data) {
    t.equal(data.filepath.indexOf('ignoremetoo'), -1)
  })

  stream.on('error', function (err) {
    t.ifError(err)
  })

  stream.on('end', function () {
    t.end()
  })
})


test('test ignore file support using hook', function (t) {
  var rules = new Rules()
  var stream = walker(path.join(__dirname, 'fixtures'), { hook: function (directory, files, next) {
    var localrules = []
    var i = files.indexOf('.ignore')
    var paths = files.map(function(file) { return path.join(directory, file) })

    if (i > -1) {
      var ignorepath = paths[i]
      localrules = fs.readFileSync(ignorepath, { encoding: 'utf-8' }).trim().split('\n')
    }

    var parentDirectories = ('./'+path.dirname(directory)).split('/').filter(onlyUnique)
    var parentRules = parentDirectories.reduce(function (prevParent, currParent) { return prevParent.concat(rules[currParent]) }, []).filter(Boolean)

    var ig = ignore().add(parentRules.concat(localrules))
    var pass = paths.filter(ig.createFilter())

    rules.add(directory, localrules)
    next(pass)

  }})

  function Rules () {}

  Rules.prototype.add = function(directory, rules) {
    if (rules && rules.length > 0) {
      var name = path.relative(process.cwd(), directory)
      if (name === './') name = '.'
      this[name] = this[name] || []
      this[name] = this[name].concat(rules)
    }
    return this
  }

  function onlyUnique(value, index, self) { 
      return self.indexOf(value) === index
  }

  stream.on('data', function (data) {
    t.equal(data.filepath.indexOf('ignoreme'), -1)
    t.equal(data.filepath.indexOf('ignoremetoo'), -1)
  })

  stream.on('error', function (err) {
    t.ifError(err)
  })

  stream.on('end', function () {
    t.end()
  })
})
