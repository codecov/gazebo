import cs from 'classnames'
import { useImpersonate } from 'services/impersonate'

import DesktopMenu from './DesktopMenu'

function Header() {
  const { isImpersonating } = useImpersonate()

  return (
    <header
      className={cs('text-white', {
        'bg-ds-gray-octonary': !isImpersonating,
        'bg-ds-pink-tertiary': isImpersonating,
      })}
    >
      <nav className="py-4 px-3 sm:px-0 flex flex-wrap gap-2 items-center container justify-between mx-auto">
        <DesktopMenu />
      </nav>
    </header>
  )
}

export default Header
