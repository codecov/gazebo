import PropType from 'prop-types'

import Icon from 'ui/Icon'
import AppLink from 'ui/AppLink'

function BackLink({ textLink, ...props }) {
  return (
    <div className="text-center flex items-center justify-center text-gray-500 bold">
      <span className="text-blue-400 inline-block mr-1">
        <Icon name="arrowLeft" />
      </span>
      Back to:
      <AppLink
        {...props}
        className="underline text-gray-500 hover:text-gray-600 visited:text-gray-500 hover:underline ml-1"
      >
        {textLink}
      </AppLink>
    </div>
  )
}

BackLink.propTypes = {
  textLink: PropType.string.isRequired,
  useRouter: PropType.bool,
  to: PropType.string,
}

export default BackLink
