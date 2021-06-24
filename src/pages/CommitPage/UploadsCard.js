import { Fragment } from 'react'
import Icon from 'ui/Icon'
import PropTypes from 'prop-types'
import groupBy from 'lodash/groupBy'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

function UploadsCard({ setShowYAMLModal, data = [] }) {
  const uploads = groupBy(data, 'provider')
  function renderUploads() {
    const _uploads = []
    for (const key in uploads) {
      _uploads.push(
        <Fragment key={key}>
          <span className="text-sm font-semibold w-full py-1 px-4">{key}</span>
          {uploads[key].map((d, i) => (
            <div
              className="border-t border-ds-gray-secondary py-2 px-4 flex flex-col"
              key={i}
            >
              <div className="flex justify-between">
                <div className="flex">
                  <a href={d?.ciUrl} className="text-ds-blue-darker mr-1">
                    {d?.ciUrl?.split('/').pop()}
                  </a>
                  <Icon size="sm" name="external-link" />
                </div>
                <span className="text-xs text-ds-gray-quinary">
                  {formatDistanceToNow(new Date(d.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <div className="flex">
                  {d.flags.length > 0 && (
                    <>
                      <Icon variant="solid" size="sm" name="flag" />
                      <span className="text-xs ml-1">{d.flags[0]}</span>
                    </>
                  )}
                </div>
                <span className="text-xs justify-self-end text-ds-blue-darker">
                  Download
                </span>
              </div>
            </div>
          ))}
        </Fragment>
      )
    }
    return _uploads
  }
  return (
    <div className="flex w-full flex-col border border-ds-gray-secondary text-ds-gray-octonary">
      <div className="flex p-4 border-b border-ds-gray-secondary flex-col">
        <div className="flex justify-between">
          <span className="text-base font-semibold">Uploads</span>
          <button
            onClick={() => setShowYAMLModal(true)}
            className="text-ds-blue-darker cursor-pointer text-xs"
          >
            view yml file
          </button>
        </div>
        <span className="text-ds-gray-quinary">
          {data.length > 0 ? `${data.length} successful` : ''}
        </span>
      </div>
      <div className="bg-ds-gray-primary h-64 max-h-64 overflow-scroll flex flex-col w-full">
        {data.length > 0 ? (
          renderUploads()
        ) : (
          <span className="py-2.5 px-4 text-xs text-ds-gray-quinary">
            Currently, no successful uploads
          </span>
        )}
      </div>
    </div>
  )
}

UploadsCard.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      state: PropTypes.string,
      provider: PropTypes.string,
      ciUrl: PropTypes.string,
      createdAt: PropTypes.string,
      downloadUrl: PropTypes.string,
      flags: PropTypes.arrayOf(PropTypes.string),
      uploadType: PropTypes.string,
      updatedAt: PropTypes.string,
    })
  ),
  setShowYAMLModal: PropTypes.func.isRequired,
}

export default UploadsCard
