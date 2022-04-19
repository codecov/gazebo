import cs from 'classnames'
import PropTypes from 'prop-types'

const getListClasses = ({ index }) =>
  cs(
    'text-left w-full px-6 py-2',
    'hover:bg-ds-gray-primary',
    'transition duration-500',
    'cursor-pointer',
    {
      'border-t border-gray-200': index !== 0,
    }
  )

function List({ items }) {
  return (
    items &&
    items.length > 0 && (
      <ul className="border border-ds-gray-secondary w-96 text-ds-gray-octonary">
        {items.map(({ name, value, onItemSelect }, index) => (
          <li
            key={name}
            className={getListClasses({ index })}
            onClick={() => onItemSelect && onItemSelect(name)}
          >
            {value}
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
      onItemSelect: PropTypes.func,
    })
  ),
}

export default List
