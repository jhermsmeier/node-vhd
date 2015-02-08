/**
 * Enumerates the available flags for
 * the ResizeVirtualDisk function.
 * ENUM.RESIZE_VIRTUAL_DISK_FLAG
 * @type {Object}
 */
module.exports = {
  // No flags are specified.
  NONE:                                   0x0,
  // If this flag is set, skip checking the virtual disk's
  // partition table to ensure that this truncation is safe.
  // Setting this flag can cause unrecoverable data loss;
  // USE WITH CARE.
  ALLOW_UNSAFE_VIRTUAL_SIZE:              0x1,
  // If this flag is set, resize the disk to the smallest
  // virtual size possible without truncating past any existing partitions.
  // If this is set, the NewSize member in the
  // RESIZE_VIRTUAL_DISK_PARAMETERS structure must be zero.
  RESIZE_TO_SMALLEST_SAFE_VIRTUAL_SIZE:   0x2,
}
