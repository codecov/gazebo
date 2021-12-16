import PropTypes from 'prop-types'

import { CommitStateEnum } from 'shared/utils/commit'
import Icon from 'ui/Icon'

export default function Header({ state }) {
  return (
    <h2 className="flex gap-1 items-center font-semibold text-base text-ds-gray-octonary">
      {state === CommitStateEnum.error && (
        <span className="text-ds-primary-red">
          <Icon size="sm" name="exclamation" variant="solid" />
        </span>
      )}
      Coverage report
    </h2>
  )
}

Header.propTypes = {
  state: PropTypes.string,
}
