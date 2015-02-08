/**
 * Contains virtual hard disk (VHD) storage dependency request flags.
 * ENUM.DETACH_VIRTUAL_DISK_FLAG
 * @type {Object}
 */
module.exports = {
  // No flags specified.
  NONE:           0x00000000,
  // Return information for volumes or
  // disks hosting the volume specified.
  HOST_VOLUMES:   0x00000001,
  // The handle provided is to a disk,
  // not a volume or file.
  DISK_HANDLE:    0x00000002,
}
