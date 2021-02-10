import PropTypes from 'prop-types'
import cs from 'classnames'

import Icon from 'ui/Icon'
import { PageButton } from './PageButton'

const pageClasses =
  'outline-none focus:ring-1 relative inline-flex items-center p-2 text-sm font-medium'
const endClasses =
  'px-4 bg-white hover:bg-gray-100 text-black disabled:text-gray-200 disabled:bg-white'

const PaginationClasses = {
  nav:
    'rounded-full relative z-0 inline-flex shadow-sm -space-x-px bg-gray-300 border border-gray-200 text-white',
  previous: cs(pageClasses, endClasses, 'rounded-l-full'),
  next: cs(pageClasses, endClasses, 'rounded-r-full'),
  current: cs(pageClasses, 'rounded-md bg-blue-400 hover:bg-blue-300'),
}

function Pagination({ onPageChange, totalPages, pointer, next, previous }) {
  return (
    <nav className={PaginationClasses.nav} aria-label="Pagination">
      <button
        onClick={() => onPageChange(pointer - 1)}
        className={PaginationClasses.previous}
        disabled={pointer === 1 || !previous}
      >
        <span className="sr-only">Previous</span>
        <Icon name="leftChevron" color="text-current" className="w-4 h-4" />
      </button>
      <PageButton
        onClick={onPageChange}
        isRendered={pointer !== 1}
        location={1}
      />
      <PageButton
        onClick={onPageChange}
        isRendered={pointer - 1 > 2}
        clickable={false}
      />
      <PageButton
        onClick={onPageChange}
        isRendered={pointer - 2 > 1}
        location={pointer - 2}
        desktopOnly={true}
      />
      <PageButton
        onClick={onPageChange}
        isRendered={pointer - 1 > 1}
        location={pointer - 1}
      />
      <button
        onClick={() => onPageChange(pointer)}
        className={PaginationClasses.current}
      >
        {pointer}
      </button>
      <PageButton
        onClick={onPageChange}
        isRendered={pointer + 1 < totalPages}
        location={pointer + 1}
      />
      <PageButton
        onClick={onPageChange}
        isRendered={pointer + 2 < totalPages}
        location={pointer + 2}
        desktopOnly={true}
      />
      <PageButton
        onClick={onPageChange}
        isRendered={pointer + 2 < totalPages}
        clickable={false}
      />
      <PageButton
        onClick={onPageChange}
        isRendered={pointer < totalPages}
        location={totalPages}
      />
      <button
        onClick={() => onPageChange(pointer + 1)}
        className={PaginationClasses.next}
        disabled={pointer === totalPages || !next}
      >
        <span className="sr-only">Next</span>
        <Icon name="rightChevron" color="text-current" className="w-4 h-4" />
      </button>
    </nav>
  )
}

Pagination.propTypes = {
  onPageChange: PropTypes.func.isRequired,
  totalPages: PropTypes.number.isRequired,
  pointer: PropTypes.number.isRequired,
  next: PropTypes.string,
  previous: PropTypes.string,
}

export default Pagination
