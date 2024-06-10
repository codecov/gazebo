import cs from 'classnames'

import { useImpersonate } from 'services/impersonate'
import { useUser } from 'services/user'

import DesktopMenu from './DesktopMenu'
import GuestHeader from './GuestHeader'

function Header() {
  const { isImpersonating } = useImpersonate()
  const { data: currentUser } = useUser({
    suspense: false,
  })

  return (
    <header
      className={cs('text-white', {
        'bg-white  border-b-2': !isImpersonating && !currentUser,
        'bg-ds-primary-base': !isImpersonating && !!currentUser,
        'bg-ds-pink-tertiary': isImpersonating,
      })}
    >
      <nav className="container mx-auto flex flex-wrap items-center justify-between gap-2 px-3 py-4 sm:px-0">
        {currentUser ? <DesktopMenu /> : <GuestHeader />}
      </nav>
    </header>
  )
}

export default Header
