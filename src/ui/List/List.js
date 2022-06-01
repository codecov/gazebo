import cs from 'classnames'
import PropTypes from 'prop-types'

const getListClasses = () =>
  cs(
    'flex text-left px-6 py-2',
    'hover:bg-ds-gray-primary',
    'transition duration-500',
    'cursor-pointer'
  )

function List({ items, onItemSelect, noBorder }) {
  return (
    items &&
    items.length > 0 && (
      <ul
        className={cs(
          'w-full text-ds-gray-octonary divide-y divide-solid divide-gray-200',
          {
            'border border-ds-gray-secondary': !noBorder,
          }
        )}
      >
        {items.map(({ name, value }) => (
          <li key={name} className={getListClasses()}>
            <button
              className="w-full"
              onClick={() => onItemSelect && onItemSelect(name)}
            >
              {value}
            </button>
          </li>
        ))}
      </ul>
    )
  )
}

List.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.element, PropTypes.string])
        .isRequired,
    })
  ),
  onItemSelect: PropTypes.func,
  noBorder: PropTypes.bool,
}

export default List
