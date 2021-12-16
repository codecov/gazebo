import { useState, Fragment } from 'react'

import A from 'ui/A'

import { useUploads } from './hooks'
import YamlModal from '../YamlModal'
import Upload from './Upload'

function UploadsCard() {
  const [showYAMLModal, setShowYAMLModal] = useState(false)
  const { uploadProviderList, uploadOverview, sortedUploads, isUploads } =
    useUploads()

  return (
    <>
      <div className="flex flex-1 flex-col border border-ds-gray-secondary text-ds-gray-octonary">
        <div className="flex p-4 border-b border-ds-gray-secondary flex-col">
          <div className="flex justify-between text-base">
            <h2 className="font-semibold">Uploads</h2>
            <A onClick={() => setShowYAMLModal(true)} hook="open yaml modal">
              <span className="text-xs">view yml file</span>
            </A>
          </div>
          <span className="text-ds-gray-quinary">{uploadOverview}</span>
        </div>
        <div className="bg-ds-gray-primary h-64 max-h-64 overflow-auto flex flex-col flex-1 divide-y divide-solid divide-ds-gray-secondary">
          {uploadProviderList.map((title) => (
            <Fragment key={title}>
              <span className="text-sm font-semibold flex-1 py-1 px-4">
                {title}
              </span>
              {sortedUploads[title].map(
                (
                  {
                    ciUrl,
                    buildCode,
                    createdAt,
                    flags = [],
                    downloadUrl,
                    errors = [],
                  },
                  i
                ) => (
                  <Upload
                    ciUrl={ciUrl}
                    buildCode={buildCode}
                    createdAt={createdAt}
                    flags={flags}
                    downloadUrl={downloadUrl}
                    errors={errors}
                    key={i}
                  />
                )
              )}
            </Fragment>
          ))}
          {isUploads && (
            <span className="py-2.5 px-4 text-xs text-ds-gray-quinary">
              Currently no uploads
            </span>
          )}
        </div>
      </div>
      <YamlModal
        showYAMLModal={showYAMLModal}
        setShowYAMLModal={setShowYAMLModal}
      />
    </>
  )
}

export default UploadsCard
