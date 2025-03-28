import { Suspense } from 'react'
import { useRouteMatch } from 'react-router-dom'

import config from 'config'

import { useImpersonate } from 'services/impersonate/useImpersonate'
import { useUser } from 'services/user'

import AdminLink from './components/AdminLink'
import GuestHeader from './components/GuestHeader'
import HelpDropdown from './components/HelpDropdown'
import Navigator from './components/Navigator'
import SeatDetails from './components/SeatDetails'
import ThemeToggle from './components/ThemeToggle'
import UserDropdown from './components/UserDropdown'

interface HeaderProps {
  hasRepoAccess?: boolean
}

function Header({ hasRepoAccess }: HeaderProps) {
  const { isImpersonating } = useImpersonate()
  const { data: currentUser } = useUser()
  const syncPageMatch = useRouteMatch('/sync')

  return (
    <header>
      {!currentUser ? <GuestHeader /> : null}
      {isImpersonating ? (
        <div className="flex justify-center bg-ds-pink-tertiary">
          <p className="text-white">Impersonating</p>
        </div>
      ) : null}
      <nav className="container flex h-14 min-h-14 w-full items-center">
        {!syncPageMatch?.isExact ? (
          <div className="flex-1">
            <Navigator
              currentUser={currentUser}
              hasRepoAccess={hasRepoAccess}
            />
          </div>
        ) : null}
        {!currentUser ? null : (
          <div className="flex items-center justify-end gap-4">
            {config.IS_SELF_HOSTED ? (
              <div className="hidden items-center justify-end gap-4 md:flex">
                <Suspense fallback={null}>
                  <SeatDetails />
                  <AdminLink />
                </Suspense>
              </div>
            ) : null}
            <ThemeToggle />
            <HelpDropdown />
            <UserDropdown />
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header
