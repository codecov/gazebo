import { ApiFilterEnum } from 'services/navigation'

export const AdminItems = [
  { label: 'Everyone', value: ApiFilterEnum.none },
  { label: 'Admins', value: ApiFilterEnum.true },
  { label: 'Collaborators', value: ApiFilterEnum.false },
]

export const ActivatedItems = [
  { label: 'All users', value: ApiFilterEnum.none },
  { label: 'Active users', value: ApiFilterEnum.true },
  { label: 'In-active users', value: ApiFilterEnum.false },
]

export const OrderItems = [
  { value: 'last_pull_timestamp', label: 'Oldest PR' },
  { value: '-last_pull_timestamp', label: 'Newest PR' },
  { value: 'name', label: 'Name Z-A' },
  { value: '-name', label: 'Name A-Z' },
]
