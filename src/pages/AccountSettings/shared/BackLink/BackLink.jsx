import PropType from 'prop-types'

import AppLink from 'old_ui/AppLink'
import Icon from 'old_ui/Icon'

function BackLink({ textLink, ...props }) {
  return (
    <div className="flex items-center justify-center text-center text-ds-gray-quinary">
      <span className="mr-1 inline-block text-ds-blue-default">
        <Icon name="arrowLeft" />
      </span>
      Back to:
      <AppLink
        {...props}
        className="ml-1 text-ds-gray-quinary underline visited:text-ds-gray-quinary hover:text-ds-gray-senary hover:underline"
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
