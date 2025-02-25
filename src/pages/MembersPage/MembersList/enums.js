import { ApiFilterEnum } from 'services/navigation/normalize'

export const AdminItems = [
  { label: 'Everyone', value: ApiFilterEnum.none },
  { label: 'Admins', value: ApiFilterEnum.true },
  { label: 'Developers', value: ApiFilterEnum.false },
]

export const ActivatedItems = [
  { label: 'All users', value: ApiFilterEnum.none },
  { label: 'Active users', value: ApiFilterEnum.true },
  { label: 'Inactive users', value: ApiFilterEnum.false },
]

export const OrderItems = [
  { value: 'name,username', desc: false, name: 'username' },
  { value: '-name,-username', desc: true, name: 'username' },
  { value: 'type', desc: false, name: 'type' },
  { value: '-type', desc: true, name: 'type' },
  { value: 'email', desc: false, name: 'email' },
  { value: '-email', desc: true, name: 'email' },
  { value: 'activated', desc: false, name: 'activationStatus' },
  { value: '-activated', desc: true, name: 'activationStatus' },
]
