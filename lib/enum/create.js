/**
 * Contains virtual hard disk (VHD) creation flags.
 * ENUM.CREATE_VIRTUAL_DISK_FLAG
 * @type {Object}
 */
module.exports = {
  // No special creation conditions; system defaults are used.
  NONE:                               0x00000000,
  // Pre-allocate all physical space necessary for the size of the virtual disk.
  FULL_PHYSICAL_ALLOCATION:           0x00000001,
  // Take ownership of the source disk during create from source disk,
  // to insure the source disk does not change during the create operation.
  // The source disk must also already be offline or read-only (or both).
  PREVENT_WRITES_TO_SOURCE_DISK:      0x2,
  // Do not copy initial virtual disk metadata or block states from the parent VHD;
  // this is useful if the parent VHD is a stand-in file and the real parent will be explicitly set later.
  DO_NOT_COPY_METADATA_FROM_PARENT:   0x4,
}
