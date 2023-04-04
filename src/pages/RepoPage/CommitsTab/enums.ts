export const statusEnum = {
  Complete: { status: 'COMPLETE', name: 'Complete' },
  Pending: { status: 'PENDING', name: 'Pending' },
  Error: { status: 'ERROR', name: 'Error' },
  Skipped: { status: 'SKIPPED', name: 'Skipped' },
} as const

export const filterItems = [
  statusEnum.Complete.name,
  statusEnum.Pending.name,
  statusEnum.Error.name,
  statusEnum.Skipped.name,
] as const

export const statusNames = {
  COMPLETE: statusEnum.Complete.name,
  PENDING: statusEnum.Pending.name,
  ERROR: statusEnum.Error.name,
  SKIPPED: statusEnum.Skipped.name,
} as const
