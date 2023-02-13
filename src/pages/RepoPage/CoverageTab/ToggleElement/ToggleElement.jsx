import cs from 'classnames'
import PropTypes from 'prop-types'
import { useState } from 'react'

import Icon from 'ui/Icon'

function ToggleElement({
  showElement = 'show',
  hideElement = 'hide',
  localStorageKey,
  children,
}) {
  const [isHidden, setIsHidden] = useState(
    () => localStorage.getItem(localStorageKey) === 'true'
  )

  return (
    <div className="hidden lg:block">
      <button
        className="flex items-center text-ds-blue cursor-pointer hover:underline mt-2"
        onClick={() => {
          setIsHidden(!isHidden)
          localStorage.setItem(localStorageKey, !isHidden)
        }}
        data-cy="toggle-chart"
        data-marketing="toggle-chart"
      >
        <Icon
          size="md"
          name={isHidden ? 'chevron-right' : 'chevron-down'}
          variant="solid"
        />
        {isHidden ? showElement : hideElement}
      </button>
      <div
        data-testid="toggle-element-contents"
        className={cs(
          'grid grid-cols-12 gap-4 border border-solid border-ds-gray-secondary p-4 mt-2',
          {
            hidden: isHidden,
          }
        )}
      >
        {children}
      </div>
    </div>
  )
}

ToggleElement.propTypes = {
  showElement: PropTypes.node,
  hideElement: PropTypes.node,
  localStorageKey: PropTypes.string.isRequired,
}

export default ToggleElement
