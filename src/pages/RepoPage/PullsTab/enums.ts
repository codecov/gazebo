export const stateEnum = {
  Merged: { state: 'MERGED', name: 'Merged' },
  Closed: { state: 'CLOSED', name: 'Closed' },
  Open: { state: 'OPEN', name: 'Open' },
} as const

export const orderingEnum = {
  Oldest: { order: 'ASC', name: 'Oldest' },
  Newest: { order: 'DESC', name: 'Newest' },
} as const

export const filterItems = [
  stateEnum.Open.name,
  stateEnum.Merged.name,
  stateEnum.Closed.name,
] as const

export const orderItems = [
  orderingEnum.Newest.name,
  orderingEnum.Oldest.name,
] as const

export const orderNames = {
  ASC: orderingEnum.Oldest.name,
  DESC: orderingEnum.Newest.name,
} as const

export const stateNames = {
  MERGED: stateEnum.Merged.name,
  CLOSED: stateEnum.Closed.name,
  OPEN: stateEnum.Open.name,
} as const
