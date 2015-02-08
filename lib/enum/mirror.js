/**
 * Contains virtual hard disk (VHD) mirror request flags.
 * ENUM.MIRROR_VIRTUAL_DISK_FLAG
 * @type {Object}
 */
module.exports = {
  // The mirror virtual disk file
  // does not exist, and needs to be created.
  NONE:            0x00000000,
  // Create the mirror using an existing file.
  EXISTING_FILE:   0x00000001,
}
