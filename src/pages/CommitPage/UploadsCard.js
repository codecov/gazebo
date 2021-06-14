import Icon from 'ui/Icon'
import PropTypes from 'prop-types'

function UploadsCard() {
  const uploads = [1, 2, 3, 4, 5, 6, 7]

  return (
    <div className="flex w-full flex-col border border-ds-gray-secondary text-ds-gray-octonary">
      <div className="flex p-4 border-b border-ds-gray-secondary flex-col">
        <div className="flex justify-between">
          <span className="text-base font-semibold">Uploads</span>
          <span className="text-ds-blue-darker text-xs">view yml file</span>
        </div>
        <span className="text-ds-gray-quinary">4 successful</span>
      </div>
      <div className="bg-ds-gray-primary max-h-64 overflow-scroll flex flex-col w-full">
        <span className="text-sm font-semibold w-full py-1 px-4">
          Circle CI
        </span>
        {uploads.map((d, i) => (
          <div
            className="border-t border-ds-gray-secondary py-2 px-4 flex flex-col"
            key={i}
          >
            <div className="flex justify-between">
              <div className="flex">
                <span className="text-ds-blue-darker mr-1">2563</span>
                <Icon size="sm" name="external-link" />
              </div>
              <span className="text-xs text-ds-gray-quinary">2 days ago</span>
            </div>
            <div className="flex justify-between mt-1">
              <div className="flex">
                <Icon variant="solid" size="sm" name="flag" />
                <span className="text-xs ml-1">macros</span>
              </div>
              <span className="text-xs text-ds-blue-darker">Download</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

UploadsCard.propTypes = {
  uploads: PropTypes.array,
}

export default UploadsCard
