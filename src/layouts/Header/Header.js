import DesktopMenu from './DesktopMenu'

function Header() {
  return (
    <header className="bg-ds-black-header text-white">
      <nav className="h-12 flex items-center container justify-between mx-auto">
        <DesktopMenu />
      </nav>
    </header>
  )
}

export default Header
