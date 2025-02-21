import eq from 'lodash/eq'
import isUndefined from 'lodash/isUndefined'
import { useState } from 'react'

import { useLocationParams } from 'services/navigation/useLocationParams'
import { useRepoBackfilled, useRepoFlagsSelect } from 'services/repo'
import { cn } from 'shared/utils/cn'
import Icon from 'ui/Icon'
import MultiSelect from 'ui/MultiSelect'

import { CoverageSelect } from './CoverageSelect'

interface TitleProps {
  title?: React.ReactNode
  children?: React.ReactNode
  sticky?: boolean
}

function Title({ title, children, sticky = false }: TitleProps) {
  return (
    <div
      data-testid="title-wrapper-div"
      className={cn(
        'flex w-full flex-1 flex-col flex-wrap items-start justify-between gap-4 bg-ds-container px-0 sm:flex-row sm:items-center md:mb-1 lg:w-auto lg:flex-none',
        { 'z-10 sticky top-0': sticky }
      )}
    >
      {title ? (
        <span className="text-base font-semibold text-ds-gray-senary">
          {title}
        </span>
      ) : null}
      <div className="flex w-full flex-wrap items-center justify-between gap-2 md:w-auto">
        {children}
      </div>
    </div>
  )
}

export default Title

export const TitleCoverage = CoverageSelect

const defaultQueryParams = {
  flags: [],
}

interface TitleFlagsProps {
  commitDetailView?: boolean
}

type LocationParams = {
  params: { flags?: string[] }
  updateParams: (params: Record<string, string[]>) => void
}

export const TitleFlags = ({ commitDetailView = false }: TitleFlagsProps) => {
  const { params, updateParams }: LocationParams =
    useLocationParams(defaultQueryParams)
  const [selectedFlags, setSelectedFlags] = useState(params?.flags)
  const [flagSearch, setFlagSearch] = useState<string | null>(null)

  const { data: repoBackfilledData } = useRepoBackfilled()

  const isTimescaleEnabled = !!repoBackfilledData?.isTimescaleEnabled
  const flagsMeasurementsActive = !!repoBackfilledData?.flagsMeasurementsActive
  const noFlagsPresent = eq(repoBackfilledData?.flagsCount, 0)

  const {
    data: flagsData,
    isLoading: flagsIsLoading,
    hasNextPage: flagsHasNextPage,
    fetchNextPage: flagsFetchNextPage,
  } = useRepoFlagsSelect({
    filters: { term: flagSearch },
    options: {
      suspense: false,
      enabled: flagsMeasurementsActive && !noFlagsPresent && isTimescaleEnabled,
    },
  })

  const flagNames = new Set()
  if (flagsMeasurementsActive) {
    params?.flags?.forEach((flag) => flagNames.add(flag))

    if (!isUndefined(flagsData)) {
      flagsData?.forEach((flag) => flagNames.add(flag?.name))
    }
  }

  if (noFlagsPresent) {
    return null
  }

  const selectorClasses = cn('w-full', {
    'sm:w-52': commitDetailView,
    'sm:w-60': !commitDetailView,
  })

  return (
    <div className={selectorClasses}>
      <MultiSelect
        // @ts-expect-error - some type errors with the multi-select
        disabled={!flagsMeasurementsActive || !isTimescaleEnabled}
        dataMarketing="fileviwer-filter-by-flags"
        ariaName="Filter by flags"
        items={[...flagNames]}
        resourceName="Flag"
        isLoading={flagsIsLoading}
        selectedItemsOverride={selectedFlags}
        onLoadMore={() => flagsHasNextPage && flagsFetchNextPage()}
        onChange={(flags: string[]) => {
          setSelectedFlags(flags)
          updateParams({ flags })
        }}
        onSearch={(term: string) => setFlagSearch(term)}
        renderSelected={(selectedItems: any[]) => (
          <span className="flex items-center gap-2">
            <Icon variant="solid" name="flag" />
            {selectedItems.length === 0 ? (
              'All flags'
            ) : (
              <span>{selectedItems.length} selected flags</span>
            )}
          </span>
        )}
      />
    </div>
  )
}

interface TitleHitCountProps {
  showHitCount?: boolean
}

export const TitleHitCount = ({ showHitCount = false }: TitleHitCountProps) => {
  if (!showHitCount) {
    return null
  }

  return (
    <div className="flex items-center gap-2 px-1">
      <span className="flex items-center justify-center justify-items-center rounded-full bg-ds-primary-green px-1.5 text-center text-white">
        n
      </span>
      <span className="text-sm">No. reports with line</span>
    </div>
  )
}
