# VHD - Virtual Hard Disk
[![npm](https://img.shields.io/npm/v/vhd.svg?style=flat-square)](https://npmjs.com/package/vhd)
[![npm](https://img.shields.io/npm/l/vhd.svg?style=flat-square)](https://npmjs.com/package/vhd)
[![npm downloads](https://img.shields.io/npm/dm/vhd.svg?style=flat-square)](https://npmjs.com/package/vhd)
[![build status](https://img.shields.io/travis/jhermsmeier/node-vhd.svg?style=flat-square)](https://travis-ci.org/jhermsmeier/node-vhd)


From [Wikipedia's VHD article]

> VHD (Virtual Hard Disk) is a file format which represents a virtual hard disk drive (HDD). It may contain what is found on a physical HDD, such as disk partitions and a file system, which in turn can contain files and folders. It is typically used as the hard disk of a virtual machine.
> The format was created by Connectix for Connectix Virtual PC product, which was later acquired by Microsoft in 2003, for what is now known as Microsoft Virtual PC.
> Since June 2005, Microsoft has made the VHD Image Format Specification available to third parties under the Microsoft Open Specification Promise.

[Wikipedia's VHD article]: https://en.wikipedia.org/wiki/VHD_(file_format)


## Install via [npm](https://npmjs.org)

```sh
$ npm install --save vhd
```

## Index
<!-- MarkdownTOC -->

- [Types](#types)
- [Limitations](#limitations)
- [Usage](#usage)
- [TODO](#todo)
  - [General](#general)
  - [Dynamic Images](#dynamic-images)
  - [Fixed Images](#fixed-images)

<!-- /MarkdownTOC -->

## Types

- **Fixed** — The VHD image file is pre-allocated on the backing store for the maximum size requested.
- **Expandable** — The VHD image file uses only as much space on the backing store as needed to store the actual data the virtual disk currently contains. **Note**: The maximum size of a dynamic virtual disk is 2,040 GB.
- **Differencing** — A parent virtual disk is used as the basis of this type, with any subsequent writes written to the virtual disk as differences to the new differencing VHD image file, and the parent VHD image file is not modified. **Note**: The maximum size of a dynamic virtual disk is 2,040 GB.

For more information, see [MSDN](http://msdn.microsoft.com/en-us/library/windows/desktop/dd323654.aspx)


## Limitations

All virtual disk types have a minimum size of 3 MB.

The VHD format has a built-in limitation of just under 2 TiB (2040 GiB) for the size of any dynamic or differencing VHDs. This is due to a sector offset table that only allows for the maximum of a 32-bit quantity - Which fits our JavaScript environment perfectly, since we can't work with 64 bit integers natively.


## Usage

```javascript
var VHD = require( 'vhd' )
```

#### Fixed size VHD

```javascript
var fixed = new VHD.Fixed( './path/to/image.vhd' )
```

```javascript
fixed.open( function( error ) {
  if( error ) {
    // Obviously, something went wrong...
  } else {
    // Ready to read/write to/from image
  }
})
```

```javascript
fixed.read( offset, length, function( error, bytesRead, buffer ) {
  // ...
})
```

```javascript
fixed.write( buffer, offset, function( error, bytesWritten, buffer ) {
  // ...
})
```

```javascript
fixed.close( function( error ) {
  // ...
})
```

## TODO

### General

- [ ] Write tests
- [ ] Add integration tests (with node-disk etc.)
- [ ] Flesh out docs
  - [ ] Generate API docs
  - [ ] Complete VHD spec doc
- [ ] Add runnable examples
- [ ] Add PR & Issue templates (?)

### Dynamic Images

- [ ] Impl BlockDevice API
  - [ ] Impl partitions
- [ ] Impl cross-sector reads
- [ ] Impl writes

### Fixed Images

- [ ] Impl BlockDevice API
  - [ ] Impl partitions

