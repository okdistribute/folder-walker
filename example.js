var path = require('path')
var walker = require('./')
var fs = require('fs')
var ignore = require('ignore')

var rules = new Rules()
var stream = walker(path.join(__dirname, 'fixtures'), { hook: function (directory, files, next) {
  var localRules = []
  var i = files.indexOf('.ignore')

  if (i > -1) {
    var full = path.join(directory, files[i])
    localRules = fs.readFileSync(full, { encoding: 'utf-8' }).trim().split('\n')
  }

  var parentDirectories = ('./'+path.dirname(directory)).split('/').filter(onlyUnique)
  var parentRules = parentDirectories.reduce(function (prevParent, currParent) { return prevParent.concat(rules[currParent]) }, []).filter(Boolean)

  var ig = ignore().add(parentRules.concat(localRules))
  var paths = files.map(function(file) { return path.join(directory, file) })
  var pass = paths.filter(ig.createFilter())

  // verbose()
  rules.add(directory, localRules)
  next(pass)

  // function verbose () {
  //   console.log('')
  //   console.log('------')
  //   console.log('')
  //   console.log('Directory:', directory)
  //   console.log('')
  //   console.log('Files:')
  //   console.log('', files.join('\n '))
  //   console.log('')
  //   console.log('Local .ignore rules:')
  //   console.log('', localRules.join('\n '))
  //   console.log('')
  //   console.log('Global .ignore rules:')
  //   Object.keys(rules).forEach(function (rule) {
  //     console.log(rule)
  //     console.log('', rules[rule].join('\n '))
  //   })
  //   console.log('')
  //   console.log('Parent directories:')
  //   console.log('',parentDirectories.join('\n '))
  //   console.log('')
  //   console.log('Parent .ignore rules:')
  //   console.log('',parentRules.join('\n '))
  //   console.log('')
  //   console.log('Files filtered:')
  //   console.log('',diff(pass, paths).join('\n '))
  //   console.log('')
  //   console.log('Files passed:')
  //   console.log('',pass.join('\n '))

  //   function diff (a1, a2) {
  //     var a = [], diff = []

  //     for (var i = 0 i < a1.length i++) {
  //         a[a1[i]] = true
  //     }

  //     for (var i = 0 i < a2.length i++) {
  //       if (a[a2[i]]) {
  //         delete a[a2[i]]
  //       } else {
  //         a[a2[i]] = true
  //       }
  //     }

  //     for (var k in a) {
  //       diff.push(k)
  //     }

  //     return diff
  //   }
  // }

}})

stream.on('data', function (data) {
  console.log('', data.relname)
})

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