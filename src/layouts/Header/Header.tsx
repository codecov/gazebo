import { useUser } from 'services/user'

import DesktopMenu from './DesktopMenu'
import GuestHeader from './GuestHeader'

function Header() {
  const { data: currentUser } = useUser({
    suspense: false,
  })

  return (
<<<<<<< HEAD
    <header
      className={cs('text-white', {
        'bg-white  border-b-2': !isImpersonating && !currentUser,
        'bg-ds-primary-base': !isImpersonating && !!currentUser,
        'bg-ds-pink-tertiary': isImpersonating,
      })}
    >
=======
    <header className="border-b-2 bg-ds-primary-base text-white">
>>>>>>> feat: codecov 24.5.1-rc2 for apply athena service
      <nav className="container mx-auto flex flex-wrap items-center justify-between gap-2 px-3 py-4 sm:px-0">
        {currentUser ? <DesktopMenu /> : <GuestHeader />}
      </nav>
    </header>
  )
}

export default Header
