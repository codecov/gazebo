export const statusEnum = {
  Completed: {
    status: 'COMPLETED',
    name: (
      <p>
        <span aria-label="Completed uploads">&#x2705;</span> Completed
      </p>
    ),
  },
  Pending: {
    status: 'PENDING',
    name: (
      <p>
        <span aria-label="Pending uploads">&#x23F3;</span> Pending
      </p>
    ),
  },
  Error: {
    status: 'ERROR',
    name: (
      <p>
        <span aria-label="Errored uploads">&#x274C;</span> Error
      </p>
    ),
  },
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
