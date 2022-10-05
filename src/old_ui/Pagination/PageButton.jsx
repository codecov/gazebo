import cs from 'classnames'
import PropTypes from 'prop-types'

const pageClasses =
  'outline-none focus:ring-1 relative inline-flex items-center p-2 text-sm font-medium'

const Pagination = {
  entry: cs(pageClasses, 'hover:bg-gray-200'),
  desktopOnly: cs(pageClasses, 'hover:bg-gray-400 hidden md:inline-flex'),
  filler: cs(pageClasses, ''),
}

export function PageButton({
  isRendered,
  location,
  clickable = true,
  desktopOnly = false,
  onClick,
}) {
  if (!isRendered) return null
  if (!clickable) {
    return <span className={Pagination.filler}>...</span>
  }
  return (
    <button
      onClick={() => onClick(location)}
      className={desktopOnly ? Pagination.desktopOnly : Pagination.entry}
    >
      {location}
    </button>
  )
}

PageButton.propTypes = {
  isRendered: PropTypes.bool.isRequired,
  location: PropTypes.number,
  clickable: PropTypes.bool,
  desktopOnly: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
}
