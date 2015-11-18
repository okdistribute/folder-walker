# folder-walker

[![NPM](https://nodei.co/npm/folder-walker.png)](https://nodei.co/npm/folder-walker/)

## Example

```
var walker = require('folder-walker')

var stream = walker('/path/to/folder')

stream.on('data', function (data) {
  console.log(data)
})
```

Example item in the stream:

```
 filepath: '/Users/karissa/dev/node_modules/folder-walker/test.js',
 stats:
  { dev: 16777220,
    mode: 33188,
    nlink: 1,
    uid: 501,
    gid: 20,
    rdev: 0,
    blksize: 4096,
    ino: 36968370,
    size: 1101,
    blocks: 8,
    atime: Wed Nov 18 2015 01:15:52 GMT-0800 (PST),
    mtime: Wed Nov 18 2015 01:15:51 GMT-0800 (PST),
    ctime: Wed Nov 18 2015 01:15:51 GMT-0800 (PST),
    birthtime: Wed Nov 18 2015 00:19:19 GMT-0800 (PST) } }
```
