import flatMap from 'lodash/flatMap'
import { Fragment, useState } from 'react'

import { useCommitErrors } from 'services/commitErrors'
import { cn } from 'shared/utils/cn'
import { NONE } from 'shared/utils/extractUploads'
import A from 'ui/A'
import { Card } from 'ui/Card'
import Checkbox from 'ui/Checkbox'
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

export const SelectState = {
  ALL_SELECTED: 'ALL_SELECTED',
  SOME_SELECTED: 'SOME_SELECTED',
  NONE_SELECTED: 'NONE_SELECTED',
} as const

function UploadsCard() {
  const [showYAMLModal, setShowYAMLModal] = useState(false)
  const [uploadFilters, setUploadFilters] = useState<UploadFilters>({
    flagErrors: false,
    uploadErrors: false,
    searchTerm: '',
  })

  const [selectedProviderSelectedUploads, setSelectedProviderSelectedUploads] =
    useState<{ [key: string]: Set<number> }>({})

  const {
    uploadsProviderList,
    uploadsOverview,
    groupedUploads,
    hasNoUploads,
    erroredUploads,
    flagErrorUploads,
    searchResults,
  } = useUploads({ filters: uploadFilters })

  const fillSelectedUploads = (provider: string) => {
    const providerUploads = groupedUploads[provider]
    const providerUploadsIndex = providerUploads?.map((_, i) => i)
    const providerList = new Set(providerUploadsIndex)
    setSelectedProviderSelectedUploads((prevState) => ({
      ...prevState,
      [provider]: new Set(providerUploadsIndex),
    }))
    return providerList
  }

  const determineCheckboxState = (provider: string) => {
    let selectedUploads
    if (selectedProviderSelectedUploads[provider] === undefined) {
      selectedUploads = fillSelectedUploads(provider)
    } else {
      selectedUploads = selectedProviderSelectedUploads[provider]
    }

    const totalUploads = groupedUploads[provider]?.length
    if (selectedUploads === undefined || selectedUploads.size === totalUploads)
      return SelectState.ALL_SELECTED
    if (selectedUploads.size === 0) return SelectState.NONE_SELECTED
    return SelectState.SOME_SELECTED
  }

  const handleSelectAllForProviderGroup = (provider: string) => {
    setSelectedProviderSelectedUploads((prevState) => ({
      ...prevState,
      [provider]:
        determineCheckboxState(provider) === SelectState.NONE_SELECTED
          ? fillSelectedUploads(provider)
          : new Set(),
    }))
  }

  const determineCheckboxIcon = (title: string) => {
    const currentCheckboxState = determineCheckboxState(title)
    if (currentCheckboxState === SelectState.ALL_SELECTED) {
      return 'check'
    } else if (currentCheckboxState === SelectState.SOME_SELECTED) {
      return 'minus'
    }
    return undefined
  }

  const onSelectChange = (
    provider: string,
    isSelected: boolean,
    key: number
  ) => {
    setSelectedProviderSelectedUploads((prevState) => {
      const updatedSet = new Set(prevState[provider] || [])

      if (isSelected) {
        updatedSet.add(key)
      } else {
        updatedSet.delete(key)
      }

      return {
        ...prevState,
        [provider]: updatedSet,
      }
    })
  }

  const { data } = useCommitErrors()

  const invalidYamlError = data?.yamlErrors?.find(
    (err) => err?.errorCode === 'invalid_yaml'
  )

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
              {invalidYamlError ? (
                <div className="flex items-center border-b border-dashed border-ds-primary-red font-light text-ds-primary-red">
                  <Icon
                    name="exclamation"
                    size="sm"
                    variant="solid"
                    label="warn"
                  />
                  <span className="ml-0.5 text-xs text-red-700">
                    view YAML file
                  </span>
                </div>
              ) : (
                <span className="text-xs">view YAML file</span>
              )}
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
                  <span
                    className={cn(
                      'sticky top-0 flex-1 border-r border-ds-gray-secondary bg-ds-gray-primary px-4 py-1 text-sm font-semibold',
                      title === NONE && 'text-ds-gray-quaternary'
                    )}
                  >
                    <div className="flex items-center">
                      <Checkbox
                        icon={determineCheckboxIcon(title)}
                        checked={determineCheckboxIcon(title) !== undefined}
                        onClick={() => handleSelectAllForProviderGroup(title)}
                      />
                      <span className="ml-2">
                        {title === NONE ? 'Provider not specified' : title}
                      </span>
                    </div>
                  </span>
                  {groupedUploads[title]?.map((upload, i) => (
                    <UploadItem
                      upload={upload}
                      key={i}
                      isSelected={
                        determineCheckboxState(title) ===
                        SelectState.NONE_SELECTED
                          ? false
                          : selectedProviderSelectedUploads[title]?.has(i)
                      }
                      onSelectChange={(isSelected: boolean) =>
                        onSelectChange(title, isSelected, i)
                      }
                    />
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
