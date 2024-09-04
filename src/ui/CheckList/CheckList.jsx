import PropTypes from 'prop-types'

import Icon from 'ui/Icon'

function CheckList({ list = [] }) {
  const className = 'flex items-center gap-1'
  return (
    <ul>
      {list.map((item) => (
        <li key={item} className={className}>
          <span className="text-ds-pink-default">
            <Icon variant="solid" name="check" />
          </span>{' '}
          {item}
        </li>
      ))}
    </ul>
  )
}

CheckList.propTypes = {
  list: PropTypes.arrayOf(PropTypes.string),
}

export default CheckList
