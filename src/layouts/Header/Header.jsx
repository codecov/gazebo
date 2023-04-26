import cs from 'classnames'

import { useImpersonate } from 'services/impersonate'

import DesktopMenu from './DesktopMenu'

function Header() {
  const { isImpersonating } = useImpersonate()

  return (
    <header
      className={cs('text-white', {
        'bg-ds-primary-base': !isImpersonating,
        'bg-ds-pink-tertiary': isImpersonating,
      })}
    >
      <nav className="container mx-auto flex flex-wrap items-center justify-between gap-2 px-3 py-4 sm:px-0">
        <DesktopMenu />
      </nav>
    </header>
  )
}

export default Header
