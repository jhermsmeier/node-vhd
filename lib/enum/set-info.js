/**
 * Contains the version of the virtual disk
 * SET_VIRTUAL_DISK_INFO structure
 * to use in calls to VHD functions.
 * ENUM.SET_VIRTUAL_DISK_INFO_VERSION
 * @type {Object}
 */
module.exports = {
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
