# folder-walker

A recursive stream of the files and directories in a given folder. Can take multiple folders.

[![build status](http://img.shields.io/travis/karissa/folder-walker.svg?style=flat)](http://travis-ci.org/karissa/folder-walker)
![dat](http://img.shields.io/badge/Development%20sponsored%20by-dat-green.svg?style=flat)

## Install

```
npm install folder-walker
```

## Example

```js
var walker = require('folder-walker')
var stream = walker(['/path/to/folder', '/another/folder/here'])
stream.on('data', function (data) {
  console.log(data)
})
```

Example item in the stream:

```
{
  basename: 'index.js',
  relname: 'test/index.js',
  filepath: '/Users/karissa/dev/node_modules/folder-walker/test/index.js',
  stat: [fs.Stat Object]
}
```
