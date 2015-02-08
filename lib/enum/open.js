/**
 * Contains virtual hard disk (VHD) or
 * CD or DVD image file (ISO) open request flags.
 * ENUM.OPEN_VIRTUAL_DISK_FLAG
 * @type {Object}
 */
module.exports = {
  // No flag specified.
  NONE:                0x00000000,
  // Open the VHD file (backing store) without
  // opening any differencing-chain parents.
  // Used to correct broken parent links.
  NO_PARENTS:          0x00000001,
  // Reserved.
  BLANK_FILE:          0x00000002,
  // Reserved.
  BOOT_DRIVE:          0x00000004,
  // Indicates that the virtual disk should
  // be opened in cached mode.
  // By default the virtual disks are opened
  // using FILE_FLAG_NO_BUFFERING and FILE_FLAG_WRITE_THROUGH.
  CACHED_IO:           0x00000008,
  // Indicates the VHD file is to be opened without
  // opening any differencing-chain parents and
  // the parent chain is to be created manually
  // using the AddVirtualDiskParent function.
  CUSTOM_DIFF_CHAIN:   0x00000010,
}
