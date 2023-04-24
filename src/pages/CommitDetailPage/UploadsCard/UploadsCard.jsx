import { Fragment, useState } from 'react'

import A from 'ui/A'

import Upload from './Upload'
import { useUploads } from './useUploads'

import YamlModal from '../YamlModal'

const NULL = 'null'

function UploadsCard() {
  const [showYAMLModal, setShowYAMLModal] = useState(false)
  const { uploadsProviderList, uploadsOverview, sortedUploads, hasNoUploads } =
    useUploads()

  return (
    <>
      <div className="flex flex-1 flex-col border border-ds-gray-secondary text-ds-gray-octonary">
        <div className="flex flex-col border-b border-ds-gray-secondary p-4">
          <div className="flex justify-between text-base">
            <h2 className="font-semibold">Uploads</h2>
            <A onClick={() => setShowYAMLModal(true)} hook="open yaml modal">
              <span className="text-xs">view yml file</span>
            </A>
          </div>
          <span className="text-ds-gray-quinary">{uploadsOverview}</span>
        </div>
        <div className="flex max-h-64 min-w-[24rem] flex-1 flex-col divide-y divide-solid divide-ds-gray-secondary overflow-auto bg-ds-gray-primary">
          {uploadsProviderList.map((title) => (
            <Fragment key={title}>
              {title !== NULL && (
                <span className="sticky top-0 flex-1 border-r border-ds-gray-secondary bg-ds-gray-primary px-4 py-1 text-sm font-semibold">
                  {title}
                </span>
              )}
              {sortedUploads[title].map(
                (
                  {
                    ciUrl,
                    buildCode,
                    createdAt,
                    flags,
                    downloadUrl,
                    errors,
                    uploadType,
                    state,
                    name,
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
                    uploadType={uploadType}
                    state={state}
                    name={name}
                  />
                )
              )}
            </Fragment>
          ))}
          {hasNoUploads && (
            <span className="px-4 py-2.5 text-xs text-ds-gray-quinary">
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
