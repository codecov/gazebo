import PropType from 'prop-types'
import { Link } from 'react-router-dom'

import Icon from 'components/Icon'

function BackLink({ textLink, to }) {
  return (
    <div className="text-center flex items-center justify-center text-gray-500 bold">
      <span className="text-blue-400 inline-block mr-1">
        <Icon name="arrowLeft" />
      </span>
      Back to:
      <Link
        to={to}
        className="underline text-gray-500 hover:text-gray-600 visited:text-gray-500 hover:underline ml-1"
      >
        {textLink}
      </Link>
    </div>
  )
}

BackLink.propTypes = {
  textLink: PropType.string.isRequired,
  to: PropType.string.isRequired,
}

export default BackLink
