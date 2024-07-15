import { Suspense } from 'react'

import config from 'config'

import { useUser } from 'services/user'

import AdminLink from './components/AdminLink'
import GuestHeader from './components/GuestHeader'
import HelpDropdown from './components/HelpDropdown'
import Navigator from './components/Navigator'
import SeatDetails from './components/SeatDetails'
import UserDropdown from './components/UserDropdown'

function Header() {
  const { data: currentUser } = useUser()

  return (
    <nav>
      {!currentUser ? <GuestHeader /> : null}
      <div className="container flex h-14 min-h-14 w-full items-center">
        <div className="flex-1">
          <Navigator currentUser={currentUser} />
        </div>
        {!currentUser ? null : (
          <div className="flex items-center justify-end gap-4">
            {config.IS_SELF_HOSTED ? (
              <Suspense fallback={null}>
                <SeatDetails />
                <AdminLink />
              </Suspense>
            ) : null}
            <HelpDropdown />
            <UserDropdown />
          </div>
        )}
      </div>
    </nav>
  )
}

export default Header
