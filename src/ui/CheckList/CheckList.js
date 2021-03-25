import uniqueId from 'lodash/uniqueId'

import PropTypes from 'prop-types'

import Icon from 'ui/Icon'

function CheckList({ list = [] }) {
  const className = 'text-sm text-ds-gray-octonary flex items-center gap-1'
  return (
    <ul>
      {list.map((item) => (
        <li key={uniqueId(item)} className={className}>
          <span className="text-ds-pink">
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
