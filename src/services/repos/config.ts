export const orderingOptions = [
  {
    text: 'Most recent commit',
    ordering: 'COMMIT_DATE',
    direction: 'DESC',
  },
  {
    text: 'Least recent commit',
    ordering: 'COMMIT_DATE',
    direction: 'ASC',
  },
  {
    text: 'Highest coverage',
    ordering: 'COVERAGE',
    direction: 'DESC',
  },
  {
    text: 'Lowest coverage',
    ordering: 'COVERAGE',
    direction: 'ASC',
  },
  {
    text: 'Name [A-Z]',
    ordering: 'NAME',
    direction: 'ASC',
  },
  {
    text: 'Name [Z-A]',
    ordering: 'NAME',
    direction: 'DESC',
  },
] as const

export const nonActiveOrderingOptions = [
  {
    text: 'Name [A-Z]',
    ordering: 'NAME',
    direction: 'ASC',
  },
  {
    text: 'Name [Z-A]',
    ordering: 'NAME',
    direction: 'DESC',
  },
] as const

export const OrderingDirection = {
  DESC: 'DESC',
  ASC: 'ASC',
} as const

export const TeamOrdering = {
  COMMIT_DATE: 'COMMIT_DATE',
  NAME: 'NAME',
} as const
