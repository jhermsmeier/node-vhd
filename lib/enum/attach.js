/**
 * Contains virtual disk attach request flags.
 * ENUM.ATTACH_VIRTUAL_DISK_FLAG
 * @type {Object}
 */
module.exports = {
  // No flags. Use system defaults.
  // This enumeration value is not supported for ISO virtual disks.
  // ATTACH_VIRTUAL_DISK_FLAG_READ_ONLY must be specified.
  NONE:                 0x00000000,
  // Attach the virtual disk as read-only.
  READ_ONLY:            0x00000001,
  // No drive letters are assigned to the disk's volumes.
  NO_DRIVE_LETTER:      0x00000002,
  // Will decouple the virtual disk lifetime from that of the VirtualDiskHandle.
  // The virtual disk will be attached until the DetachVirtualDisk function is called,
  // even if all open handles to the virtual disk are closed.
  PERMANENT_LIFETIME:   0x00000004,
  // Reserved.
  // This flag is not supported for ISO virtual disks.
  NO_LOCAL_HOST:        0x00000008,
}
