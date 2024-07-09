import config from 'config'

import { useUser } from 'services/user'

import AdminLink from './components/AdminLink'
import HelpDropdown from './components/HelpDropdown'
import SeatDetails from './components/SeatDetails'
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
        {config.IS_SELF_HOSTED ? (
          <>
            <SeatDetails />
            <AdminLink />
          </>
        ) : null}
        <HelpDropdown />
        <UserDropdown />
      </div>
    </div>
  )
}

export default Header
