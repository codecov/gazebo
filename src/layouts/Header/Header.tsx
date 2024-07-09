import { useUser } from 'services/user'

import HelpDropdown from './components/HelpDropdown'
import UserDropdown from './components/UserDropdown'

function Header() {
  const { data: currentUser } = useUser()

  if (!currentUser) {
    return <h1>Guest header</h1>
  }

  return (
    <div className="container flex h-14 w-full items-center">
      <div className="flex-1">Navigation</div>
      <div className="flex items-center gap-4">
        <div>Self hosted stuff</div>
        <HelpDropdown />
        <UserDropdown />
      </div>
    </div>
  )
}

export default Header
