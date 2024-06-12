export const statusEnum = {
  COMPLETED: {
    status: 'COMPLETED',
    option: (
      <>
        <span aria-label="Completed uploads">&#x2705;</span> Completed
      </>
    ),
  },
  PENDING: {
    status: 'PENDING',
    option: (
      <>
        <span aria-label="Pending uploads">&#x23F3;</span> Pending
      </>
    ),
  },
  ERROR: {
    status: 'ERROR',
    option: (
      <>
        <span aria-label="Errored uploads">&#x274C;</span> Error
      </>
    ),
  },
} as const

export const filterItems = Object.values(statusEnum)
