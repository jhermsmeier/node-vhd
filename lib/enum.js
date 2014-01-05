/**
 * VHD Enumerations
 * @see http://msdn.microsoft.com/en-us/library/windows/desktop/dd323698.aspx
 * @type {Object}
 */
var ENUM = require( './vhd' )

/**
 * Contains virtual disk attach request flags.
 * @type {Object}
 */
ENUM.ATTACH_VIRTUAL_DISK_FLAG = {
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

/**
 * Contains the version of the virtual hard disk (VHD)
 * ATTACH_VIRTUAL_DISK_PARAMETERS structure to use in calls to VHD functions.
 * @type {Object}
 */
ENUM.ATTACH_VIRTUAL_DISK_VERSION = {
  UNSPECIFIED:   0,
  1:             1,
}

/**
 * Contains virtual disk compact request flags.
 * @type {Object}
 */
ENUM.COMPACT_VIRTUAL_DISK_FLAG = {
  NONE: 0x00000000,
}

/**
 * Contains the version of the virtual hard disk (VHD)
 * COMPACT_VIRTUAL_DISK_PARAMETERS structure to use in calls to VHD functions.
 * @type {Object}
 */
ENUM.COMPACT_VIRTUAL_DISK_VERSION = {
  UNSPECIFIED:   0,
  1:             1,
}

/**
 * Contains virtual hard disk (VHD) creation flags.
 * @type {Object}
 */
ENUM.CREATE_VIRTUAL_DISK_FLAG = {
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

/**
 * Contains the version of the virtual disk
 * CREATE_VIRTUAL_DISK_PARAMETERS structure
 * to use in calls to virtual disk functions.
 * @type {Object}
 */
ENUM.CREATE_VIRTUAL_DISK_VERSION = {
  UNSPECIFIED:   0,
  1:             1,
  2:             2,
}

/**
 * Contains virtual hard disk (VHD) dependency information flags.
 * @type {Object}
 */
ENUM.DEPENDENT_DISK_FLAG = {
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

/**
 * Contains virtual disk detach request flags.
 * @type {Object}
 */
ENUM.DETACH_VIRTUAL_DISK_FLAG = {
  NONE:   0x00000000,
}

/**
 * Contains virtual hard disk (VHD) expand request flags.
 * @type {Object}
 */
ENUM.EXPAND_VIRTUAL_DISK_FLAG = {
  NONE:   0x00000000,
}

/**
 * Contains the version of the virtual disk
 * EXPAND_VIRTUAL_DISK_PARAMETERS structure
 * to use in calls to virtual disk functions.
 * @type {Object}
 */
ENUM.EXPAND_VIRTUAL_DISK_VERSION = {
  UNSPECIFIED:   0,
  1:             1,
}

/**
 * Contains virtual hard disk (VHD) storage dependency request flags.
 * @type {Object}
 */
ENUM.GET_STORAGE_DEPENDENCY_FLAG = {
  // No flags specified.
  NONE:           0x00000000,
  // Return information for volumes or
  // disks hosting the volume specified.
  HOST_VOLUMES:   0x00000001,
  // The handle provided is to a disk,
  // not a volume or file.
  DISK_HANDLE:    0x00000002,
}

/**
 * Contains virtual hard disk (VHD) information retrieval identifiers.
 * For more information, see GET_VIRTUAL_DISK_INFO.
 * @type {Object}
 */
ENUM.GET_VIRTUAL_DISK_INFO_VERSION = {
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

/**
 * Contains virtual hard disk (VHD) merge request flags.
 * @type {Object}
 */
ENUM.MERGE_VIRTUAL_DISK_FLAG  = {
  NONE:   0x00000000,
}

/**
 * Contains the version of the virtual hard disk (VHD)
 * MERGE_VIRTUAL_DISK_PARAMETERS structure
 * to use in calls to VHD functions.
 * @type {Object}
 */
ENUM.MERGE_VIRTUAL_DISK_VERSION = {
  UNSPECIFIED:   0,
  1:             1,
  2:             2,
}

/**
 * Contains virtual hard disk (VHD) mirror request flags.
 * @type {Object}
 */
ENUM.MIRROR_VIRTUAL_DISK_FLAG = {
  // The mirror virtual disk file
  // does not exist, and needs to be created.
  NONE:            0x00000000,
  // Create the mirror using an existing file.
  EXISTING_FILE:   0x00000001,
}

/**
 * Contains the version of the virtual disk
 * MIRROR_VIRTUAL_DISK_PARAMETERS structure
 * used by the MirrorVirtualDisk function.
 * @type {Object}
 */
ENUM.MIRROR_VIRTUAL_DISK_VERSION = {
  UNSPECIFIED:   0,
  1:             1,
}

/**
 * Contains virtual hard disk (VHD) or
 * CD or DVD image file (ISO) open request flags.
 * @type {Object}
 */
ENUM.OPEN_VIRTUAL_DISK_FLAG = {
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

/**
 * Contains the version of the virtual disk
 * OPEN_VIRTUAL_DISK_PARAMETERS structure
 * to use in calls to virtual disk functions.
 * @type {Object}
 */
ENUM.OPEN_VIRTUAL_DISK_VERSION = {
  UNSPECIFIED:   0,
  1:             1,
  2:             2,
}

/**
 * Enumerates the available flags for
 * the ResizeVirtualDisk function.
 * @type {Object}
 */
ENUM.RESIZE_VIRTUAL_DISK_FLAG = {
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

/**
 * Enumerates the possible versions for
 * parameters for the ResizeVirtualDisk function.
 * @type {Object}
 */
ENUM.RESIZE_VIRTUAL_DISK_VERSION = {
  UNSPECIFIED:   0,
  1:             1,
}

/**
 * Contains the version of the virtual disk
 * SET_VIRTUAL_DISK_INFO structure
 * to use in calls to VHD functions.
 * @type {Object}
 */
ENUM.SET_VIRTUAL_DISK_INFO_VERSION = {
  // Not used. Will fail the operation.
  UNSPECIFIED:              0,
  // Parent information is being set.
  PARENT_PATH:              1,
  // A unique identifier is being set.
  IDENTIFIER:               2,
  // Sets the parent file path and the child depth.
  PARENT_PATH_WITH_DEPTH:   3,
  // Sets the physical sector size reported by the VHD.
  PHYSICAL_SECTOR_SIZE:     4,
}

/**
 * Contains the version of the virtual hard disk (VHD)
 * STORAGE_DEPENDENCY_INFO structure
 * to use in calls to VHD functions.
 * @type {Object}
 */
ENUM.STORAGE_DEPENDENCY_INFO_VERSION = {
  // The version is not specified.
  UNSPECIFIED:   0,
  // Specifies STORAGE_DEPENDENCY_INFO_TYPE_1.
  1:             1,
  // Specifies STORAGE_DEPENDENCY_INFO_TYPE_2.
  2:             2,
}

/**
 * Contains the bitmask for specifying access
 * rights to a virtual hard disk (VHD) or
 * CD or DVD image file (ISO).
 * @type {Object}
 */
ENUM.VIRTUAL_DISK_ACCESS_MASK = {
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
