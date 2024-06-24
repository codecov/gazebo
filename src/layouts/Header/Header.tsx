import { useUser } from 'services/user'

import DesktopMenu from './DesktopMenu'
import GuestHeader from './GuestHeader'

function Header() {
  const { data: currentUser } = useUser({
    suspense: false,
  })

  return (
    <header className="border-b-2 bg-ds-primary-base text-white">
      <nav className="container mx-auto flex flex-wrap items-center justify-between gap-2 px-3 py-4 sm:px-0">
        {currentUser ? <DesktopMenu /> : <GuestHeader />}
      </nav>
    </header>
  )
}

export default Header
