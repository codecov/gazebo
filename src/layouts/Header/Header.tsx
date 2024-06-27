import { useUser } from 'services/user'

import UserDropdown from './components/UserDropdown'

function Header() {
  const { data: currentUser } = useUser()

  if (!currentUser) {
    return <h1>Guest header</h1>
  }

  return (
    <div className="container flex h-14 w-full items-center">
      <div className="flex-1">Navigation</div>
      <div className="flex items-center gap-2">
        <div>Self hosted stuff</div>
        <div>Help dropdown</div>
        <UserDropdown />
      </div>
    </div>
  )
}

export default Header
