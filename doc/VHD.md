# Virtual Hard Disk Image Format

Specification Download: https://technet.microsoft.com/en-us/library/bb676673.aspx

<!-- MarkdownTOC -->

- [Layout](#layout)
  - [Basic Format](#basic-format)
  - [Hard Disk Footer](#hard-disk-footer)
  - [Dynamic Disk Header](#dynamic-disk-header)
- [Mapping a Disk Sector to a Sector in the Block](#mapping-a-disk-sector-to-a-sector-in-the-block)

<!-- /MarkdownTOC -->

## Layout


### Basic Format

| Dynamic Disk header fields           |
|--------------------------------------|
| Copy of hard disk footer (512 bytes) |
| Dynamic Disk Header (1024 bytes)     |
| BAT (Block Allocation table)         |
| Data Block 1                         |
| Data Block 2                         |
| …                                    |
| Data Block n                         |
| Hard Disk Footer (512 bytes)         |


### Hard Disk Footer

| Field Name          | Size (bytes) |
|---------------------|--------------|
| Cookie              | 8            |
| Features            | 4            |
| File Format Version | 4            |
| Data Offset         | 8            |
| Time Stamp          | 4            |
| Creator Application | 4            |
| Creator Version     | 4            |
| Creator Host OS     | 4            |
| Original Size       | 8            |
| Current Size        | 8            |
| Disk Geometry       | 4            |
| Disk Type           | 4            |
| Checksum            | 4            |
| Unique Id           | 16           |
| Saved State         | 1            |
| Reserved            | 427          |


### Dynamic Disk Header

| Field Name                 | Size (bytes) |
|----------------------------|--------------|
| Cookie                     | 8            |
| Data Offset                | 8            |
| Table Offset               | 8            |
| Header Version             | 4            |
| Max Table Entries          | 4            |
| Block Size                 | 4            |
| Checksum                   | 4            |
| Parent Unique ID           | 16           |
| Parent Time Stamp          | 4            |
| Reserved                   | 4            |
| Parent Unicode Name        | 512          |
| Parent Locator Entry 1     | 24           |
| Parent Locator Entry 2     | 24           |
| Parent Locator Entry 3     | 24           |
| Parent Locator Entry 4     | 24           |
| Parent Locator Entry 5     | 24           |
| Parent Locator Entry 6     | 24           |
| Parent Locator Entry 7     | 24           |
| Parent Locator Entry 8     | 24           |
| Reserved                   | 256          |


## Mapping a Disk Sector to a Sector in the Block

```c
BlockNumber = floor(RawSectorNumber / SectorsPerBlock)
```

```c
SectorInBlock = RawSectorNumber % SectorsPerBlock
```

```c
ActualSectorLocation = BAT[BlockNumber] + BlockBitmapSectorCount + SectorInBlock
```
