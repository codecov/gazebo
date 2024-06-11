export const statusEnum = {
  Completed: { status: 'COMPLETED', name: 'Completed' },
  Pending: { status: 'PENDING', name: 'Pending' },
  Error: { status: 'ERROR', name: 'Error' },
} as const

export const filterItems = [
  statusEnum.Completed.name,
  statusEnum.Pending.name,
  statusEnum.Error.name,
] as const

export const statusNames = {
  COMPLETED: statusEnum.Completed.name,
  PENDING: statusEnum.Pending.name,
  ERROR: statusEnum.Error.name,
} as const
