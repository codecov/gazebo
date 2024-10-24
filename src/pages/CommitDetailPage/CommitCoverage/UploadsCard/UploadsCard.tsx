import flatMap from 'lodash/flatMap'
import { Fragment, useState } from 'react'

import { NONE } from 'shared/utils/extractUploads'
import A from 'ui/A'
import { Card } from 'ui/Card'
import Icon from 'ui/Icon'
import SearchField from 'ui/SearchField'

import UploadItem from './UploadItem'
import { useUploads } from './useUploads'

import YamlModal from '../YamlModal'

export interface UploadFilters {
  flagErrors: boolean
  uploadErrors: boolean
  searchTerm: string
}

function UploadsCard() {
  const [showYAMLModal, setShowYAMLModal] = useState(false)
  const [uploadFilters, setUploadFilters] = useState<UploadFilters>({
    flagErrors: false,
    uploadErrors: false,
    searchTerm: '',
  })

  const {
    uploadsProviderList,
    uploadsOverview,
    groupedUploads,
    hasNoUploads,
    erroredUploads,
    flagErrorUploads,
    searchResults,
  } = useUploads({ filters: uploadFilters })

  const uploadErrorCount = flatMap(erroredUploads).length
  const flagErrorCount = flatMap(flagErrorUploads).length

  return (
    <>
      <Card className="overflow-x-hidden">
        <Card.Header className="p-4">
          <div className="flex justify-between">
            <Card.Title size="base">Coverage reports history</Card.Title>
            {/* @ts-expect-error */}
            <A onClick={() => setShowYAMLModal(true)} hook="open yaml modal">
              <span className="text-xs">view YAML file</span>
            </A>
          </div>
          <Card.Description className="text-ds-gray-quinary">
            {uploadsOverview}
          </Card.Description>
        </Card.Header>
        <Card.Header className="p-4">
          <UploadsFilters
            uploadErrorCount={uploadErrorCount}
            flagErrorCount={flagErrorCount}
            uploadFilters={uploadFilters}
            setUploadFilters={setUploadFilters}
          />
        </Card.Header>
        <div className="flex max-h-64 min-w-96 flex-1 flex-col divide-y divide-solid divide-ds-gray-secondary overflow-auto bg-ds-gray-primary dark:bg-ds-blue-default/5">
          {uploadFilters.searchTerm !== '' && searchResults
            ? searchResults.map((upload, i) => (
                <UploadItem upload={upload} key={i} />
              ))
            : uploadsProviderList.map((title) => (
                <Fragment key={title}>
                  {title !== NONE && (
                    <span className="sticky top-0 flex-1 border-r border-ds-gray-secondary bg-ds-gray-primary px-4 py-1 text-sm font-semibold">
                      {title}
                    </span>
                  )}
                  {groupedUploads[title]?.map((upload, i) => (
                    <UploadItem upload={upload} key={i} />
                  ))}
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

interface UploadsFiltersProps {
  uploadErrorCount: number
  flagErrorCount: number
  uploadFilters: UploadFilters
  setUploadFilters: (value: UploadFilters) => void
}

function UploadsFilters({
  uploadErrorCount: erroredUploadCount,
  flagErrorCount: flagErrorUploadCount,
  uploadFilters,
  setUploadFilters,
}: UploadsFiltersProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          {flagErrorUploadCount ? (
            <div className="flex items-center gap-2 pb-2">
              <div className="flex items-center border-b border-dashed border-ds-primary-red font-light text-ds-primary-red">
                <Icon name="exclamation" size="sm" variant="solid" />
                {flagErrorUploadCount} flag errors
              </div>
              {uploadFilters.flagErrors ? (
                <button
                  className="text-xs font-semibold text-ds-blue-default hover:underline"
                  onClick={() => {
                    setUploadFilters({ ...uploadFilters, flagErrors: false })
                  }}
                  data-testid="flag-errors-filter"
                >
                  clear
                </button>
              ) : (
                <button
                  className="text-xs text-ds-blue-default hover:underline"
                  onClick={() => {
                    setUploadFilters({ ...uploadFilters, flagErrors: true })
                  }}
                  data-testid="flag-errors-filter"
                >
                  view
                </button>
              )}
            </div>
          ) : null}
          {erroredUploadCount ? (
            <div className="flex items-center gap-2 pb-2">
              <div className="flex items-center border-b border-dashed border-ds-primary-red font-light text-ds-primary-red">
                <Icon name="exclamation" size="sm" variant="solid" />
                {erroredUploadCount} upload errors
              </div>
              {uploadFilters.uploadErrors ? (
                <button
                  className="text-xs font-semibold text-ds-blue-default hover:underline"
                  onClick={() =>
                    setUploadFilters({
                      ...uploadFilters,
                      uploadErrors: false,
                    })
                  }
                  data-testid="upload-errors-filter"
                >
                  clear
                </button>
              ) : (
                <button
                  className="text-xs text-ds-blue-default hover:underline"
                  onClick={() =>
                    setUploadFilters({ ...uploadFilters, uploadErrors: true })
                  }
                  data-testid="upload-errors-filter"
                >
                  view
                </button>
              )}
            </div>
          ) : null}
        </div>
        {uploadFilters.uploadErrors ||
        uploadFilters.flagErrors ||
        uploadFilters.searchTerm ? (
          <button
            className="pb-2 text-xs font-semibold text-ds-blue-default hover:underline"
            onClick={() =>
              setUploadFilters({
                flagErrors: false,
                uploadErrors: false,
                searchTerm: '',
              })
            }
          >
            clear all filters
          </button>
        ) : null}
      </div>
      <SearchField
        /* @ts-expect-error needs to be converted to TS */
        placeholder="Search by upload or flag name"
        dataMarketing="uploads-list-searchx"
        searchValue={uploadFilters.searchTerm}
        setSearchValue={(val: string) =>
          setUploadFilters({ ...uploadFilters, searchTerm: val })
        }
      />
    </div>
  )
}

export default UploadsCard
