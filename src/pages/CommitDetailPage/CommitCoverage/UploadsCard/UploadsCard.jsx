import { Fragment, useState } from 'react'

import { NONE } from 'shared/utils/extractUploads'
import A from 'ui/A'
import { Card } from 'ui/Card'

import Upload from './Upload'
import { useUploads } from './useUploads'

import YamlModal from '../YamlModal'

function UploadsCard() {
  const [showYAMLModal, setShowYAMLModal] = useState(false)
  const { uploadsProviderList, uploadsOverview, groupedUploads, hasNoUploads } =
    useUploads()

  return (
    <>
      <Card className="overflow-x-hidden">
        <Card.Header>
          <div className="flex justify-between">
            <Card.Title size="base">Uploads</Card.Title>
            <A onClick={() => setShowYAMLModal(true)} hook="open yaml modal">
              <span className="text-xs">view YAML file</span>
            </A>
          </div>
          <Card.Description className="text-ds-gray-quinary">
            {uploadsOverview}
          </Card.Description>
        </Card.Header>
        <div className="flex max-h-64 min-w-96 flex-1 flex-col divide-y divide-solid divide-ds-gray-secondary overflow-auto bg-ds-gray-primary dark:bg-ds-blue-default/5">
          {uploadsProviderList.map((title) => (
            <Fragment key={title}>
              {title !== NONE && (
                <span className="sticky top-0 flex-1 border-r border-ds-gray-secondary bg-ds-gray-primary px-4 py-1 text-sm font-semibold">
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
      </Card>
      <YamlModal
        showYAMLModal={showYAMLModal}
        setShowYAMLModal={setShowYAMLModal}
      />
    </>
  )
}

export default UploadsCard
