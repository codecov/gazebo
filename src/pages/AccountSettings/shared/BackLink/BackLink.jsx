import PropType from 'prop-types'

import AppLink from 'old_ui/AppLink'
import Icon from 'old_ui/Icon'

function BackLink({ textLink, ...props }) {
  return (
    <div className="flex items-center justify-center text-center text-gray-500">
      <span className="mr-1 inline-block text-blue-400">
        <Icon name="arrowLeft" />
      </span>
      Back to:
      <AppLink
        {...props}
        className="ml-1 text-gray-500 underline visited:text-gray-500 hover:text-gray-600 hover:underline"
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
