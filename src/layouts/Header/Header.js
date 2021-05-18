import DesktopMenu from './DesktopMenu'

function Header() {
  return (
    <header className="bg-ds-gray-octonary text-white">
      <nav className="h-14 flex items-center container justify-between mx-auto">
        <DesktopMenu />
      </nav>
    </header>
  )
}

export default Header
