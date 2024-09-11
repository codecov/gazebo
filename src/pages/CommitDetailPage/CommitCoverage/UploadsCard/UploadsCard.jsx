import { Fragment, useState } from 'react'

import { NONE } from 'shared/utils/extractUploads'
import A from 'ui/A'

import Upload from './Upload'
import { useUploads } from './useUploads'

import YamlModal from '../YamlModal'

function UploadsCard() {
  const [showYAMLModal, setShowYAMLModal] = useState(false)
  const { uploadsProviderList, uploadsOverview, groupedUploads, hasNoUploads } =
    useUploads()

  return (
    <>
      <div className="flex flex-1 flex-col border border-ds-gray-secondary text-ds-gray-octonary">
        <div className="flex flex-col border-b border-ds-gray-secondary p-4">
          <div className="flex justify-between text-base">
            <h2 className="font-semibold">Uploads</h2>
            <A onClick={() => setShowYAMLModal(true)} hook="open yaml modal">
              <span className="text-xs">view YAML file</span>
            </A>
          </div>
          <span className="text-ds-gray-quinary">{uploadsOverview}</span>
        </div>
        {/* dark:bg-opacity-5 passes linting in TSX files but triggers a warning in JSX. Once this file is converted to TSX, the linter should pass without issues. */}
        {/* eslint-disable-next-line tailwindcss/migration-from-tailwind-2*/}
        <div className="flex max-h-64 min-w-96 flex-1 flex-col divide-y divide-solid divide-ds-gray-secondary overflow-auto bg-ds-gray-primary dark:bg-ds-blue-default dark:bg-opacity-5">
          {uploadsProviderList.map((title) => (
            <Fragment key={title}>
              {title !== NONE && (
                <span className="sticky top-0 flex-1 border-r border-ds-gray-secondary bg-ds-gray-primary px-4 py-1 text-sm font-semibold">
                  asfsa
                  {title}
                </span>
              )}
              {groupedUploads[title].map(
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
                    id,
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
                    id={id}
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
