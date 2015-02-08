/**
 * Contains the bitmask for specifying access
 * rights to a virtual hard disk (VHD) or
 * CD or DVD image file (ISO).
 * ENUM.VIRTUAL_DISK_ACCESS_MASK
 * @type {Object}
 */
modul.exports = {
  // Open the virtual disk with no access.
  // This is the only supported value when calling
  // CreateVirtualDisk and specifying CREATE_VIRTUAL_DISK_VERSION_2
  // in the VirtualDiskAccessMask parameter.
  NONE:        0x00000000,
  // Open the virtual disk for read-only attach access.
  // The caller must have READ access to the virtual disk image file.
  // 
  // If used in a request to open a virtual disk that is already open,
  // the other handles must be limited to either
  // VIRTUAL_DISK_ACCESS_DETACH or VIRTUAL_DISK_ACCESS_GET_INFO access,
  // otherwise the open request with this flag will fail.
  ATTACH_RO:   0x00010000,
  // Open the virtual disk for read/write attaching access.
  // The caller must have (READ | WRITE) access to the virtual disk image file.
  // 
  // If used in a request to open a virtual disk that is already open,
  // the other handles must be limited to either
  // VIRTUAL_DISK_ACCESS_DETACH or VIRTUAL_DISK_ACCESS_GET_INFO access,
  // otherwise the open request with this flag will fail.
  // 
  // If the virtual disk is part of a differencing chain,
  // the disk for this request cannot be less than the RWDepth
  // specified during the prior open request for that differencing chain.
  // 
  // This flag is not supported for ISO virtual disks.
  ATTACH_RW:   0x00020000,
  // Open the virtual disk to allow detaching of an attached virtual disk.
  // The caller must have (FILE_READ_ATTRIBUTES | FILE_READ_DATA)
  // access to the virtual disk image file.
  DETACH:      0x00040000,
  // Information retrieval access to the virtual disk.
  // The caller must have READ access to the virtual disk image file.
  GET_INFO:    0x00080000,
  // Virtual disk creation access.
  CREATE:      0x00100000,
  // Open the virtual disk to perform offline meta-operations.
  // The caller must have (READ | WRITE) access to the virtual disk image file,
  // up to RWDepth if working with a differencing chain.
  // 
  // If the virtual disk is part of a differencing chain,
  // the backing store (host volume) is opened in RW exclusive mode up to RWDepth.
  // 
  // This flag is not supported for ISO virtual disks.
  METAOPS:     0x00200000,
  // Reserved.
  READ:        0x000d0000,
  // Allows unrestricted access to the virtual disk.
  // The caller must have unrestricted access rights to the virtual disk image file.
  // This flag is not supported for ISO virtual disks.
  ALL:         0x003f0000,
  // Reserved.
  WRITABLE:    0x00320000,
}
