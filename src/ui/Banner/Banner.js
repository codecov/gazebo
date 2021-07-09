import { useLocalStorage } from 'react-use'
import PropTypes from 'prop-types'

import Icon from 'ui/Icon'

function Banner({ title, storageId, children }) {
  const [dismissed, setDismissed] = useLocalStorage(
    `banner-${storageId}`,
    false
  )

  function dismissHandler() {
    setDismissed(true)
  }

  return (
    !dismissed && (
      <div className="bg-ds-gray-primary text-ds-gray-octonary border-l-4 border-ds-blue-quinary p-4">
        <div className="flex justify-between items-center pb-2 font-semibold">
          <h2 className="font-semibold">{title}</h2>
          <button
            className="cursor-pointer fill-current text-ds-gray-septenary"
            onClick={dismissHandler}
          >
            <Icon name="x" />
            <span className="sr-only">Dismiss banner</span>
          </button>
        </div>
        <div className="w-full text-ds-gray-octonary text-sm">{children}</div>
      </div>
    )
  )
}

Banner.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.element.isRequired,
    PropTypes.string.isRequired,
  ]),
  storageId: PropTypes.string.isRequired,
}

export default Banner
