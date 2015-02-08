/**
 * Contains virtual hard disk (VHD) information retrieval identifiers.
 * ENUM.GET_VIRTUAL_DISK_INFO_VERSION
 * For more information, see GET_VIRTUAL_DISK_INFO.
 * @type {Object}
 */
module.exports = {
  // Reserved. This value should not be used.
  UNSPECIFIED:                  0x00,
  // Information related to the virtual disk size,
  // including total size, physical allocation used,
  // block size, and sector size.
  SIZE:                         0x01,
  // The unique identifier.
  // This identifier is persistently stored in the
  // virtual disk and will not change even if the
  // virtual disk file is copied to another file.
  IDENTIFIER:                   0x02,
  // The paths to parent virtual disks.
  // Valid only for differencing virtual disks.
  PARENT_LOCATION:              0x03,
  // The unique identifier of the parent virtual disk.
  // Valid only for differencing virtual disks.
  PARENT_IDENTIFIER:            0x04,
  // The time stamp of the parent when the child virtual disk was created.
  // Valid only for differencing virtual disks.
  PARENT_TIMESTAMP:             0x05,
  // The device identifier and vendor identifier
  // that identify the type of virtual disk.
  VIRTUAL_STORAGE_TYPE:         0x06,
  // The type of virtual disk.
  PROVIDER_SUBTYPE:             0x07,
  // Indicates whether the virtual disk is 4 KB aligned.
  IS_4K_ALIGNED:                0x08,
  // Details about the physical disk on
  // which the virtual disk resides.
  PHYSICAL_DISK:                0x09,
  // The physical sector size of the virtual disk.
  VHD_PHYSICAL_SECTOR_SIZE:     0x0A,
  // The smallest safe minimum size of the virtual disk.
  SMALLEST_SAFE_VIRTUAL_SIZE:   0x0B,
  // The fragmentation level of the virtual disk.
  FRAGMENTATION:                0x0C,
}
