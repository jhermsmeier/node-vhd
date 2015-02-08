/**
 * Contains virtual hard disk (VHD) dependency information flags.
 * ENUM.DEPENDENT_DISK_FLAG
 * @type {Object}
 */
module.exports = {
  // No flags specified. Use system defaults.
  NONE:                   0x00000000,
  // Multiple files backing the virtual disk.
  MULT_BACKING_FILES:     0x00000001,
  // Fully allocated virtual disk.
  FULLY_ALLOCATED:        0x00000002,
  // Read-only virtual disk.
  READ_ONLY:              0x00000004,
  // The backing file of the virtual disk
  // is not on a local physical disk.
  REMOTE:                 0x00000008,
  // Reserved.
  SYSTEM_VOLUME:          0x00000010,
  // The backing file of the virtual disk
  // is on the system volume.
  SYSTEM_VOLUME_PARENT:   0x00000020,
  // The backing file of the virtual disk
  // is on a removable physical disk.
  REMOVABLE:              0x00000040,
  // Drive letters are not automatically assigned
  // to the volumes on the virtual disk.
  NO_DRIVE_LETTER:        0x00000080,
  // The virtual disk is a parent of a differencing chain.
  PARENT:                 0x00000100,
  // The virtual disk is not attached to the local host.
  // For example, it is attached to a guest virtual machine.
  NO_HOST_DISK:           0x00000200,
  // The lifetime of the virtual disk is not
  // tied to any application or process.
  PERMANENT_LIFETIME:     0x00000400,
}
