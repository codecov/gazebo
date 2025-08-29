import capitalize from 'lodash/capitalize'
import { useState } from 'react'

import { useLocationParams } from 'services/navigation/useLocationParams'
import Button from 'ui/Button'
import SearchField from 'ui/SearchField'

import { TestResultsFilterParameter } from '../hooks/useInfiniteTestResults/useInfiniteTestResults'
import { defaultQueryParams } from '../SelectorSection'

interface TableHeaderProps {
  totalCount: number
  showResetButton: boolean
}

const getHeaderTitle = (parameter: keyof typeof TestResultsFilterParameter) => {
  return parameter && TestResultsFilterParameter[parameter]
    ? capitalize(parameter.replace('_', ' '))
    : 'Tests'
}

const TableHeader: React.FC<TableHeaderProps> = ({
  totalCount,
  showResetButton,
}) => {
  const { params, updateParams } = useLocationParams(defaultQueryParams)
  // @ts-expect-error, useLocationParams needs to be updated to have full types
  const [searchTerm, setSearchTerm] = useState(params.term)

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    updateParams({ ...params, term: value })
  }

  const isParamsDefault =
    JSON.stringify(params) === JSON.stringify(defaultQueryParams)

  return (
    <>
      <hr />
      <div className="flex items-center justify-between py-2">
        <h2 className="pl-4 text-lg font-semibold capitalize">
          {/* @ts-expect-error, params is not typed */}
          {getHeaderTitle(params?.parameter)} (
          {totalCount > 999 ? `${(totalCount / 1000).toFixed(1)}K` : totalCount}
          )
        </h2>
        <div className="flex items-center gap-2">
          <SearchField
            // @ts-expect-error, component is not typed
            dataMarketing="search-failed-tests"
            placeholder="Search by name"
            searchValue={searchTerm}
            setSearchValue={handleSearchChange}
            data-testid="search-input-failed-tests"
          />
          {showResetButton && (
            <Button
              disabled={isParamsDefault}
              to={undefined}
              hook="reset-failed-tests"
              onClick={() => {
                if (!isParamsDefault) {
                  updateParams(defaultQueryParams)
                  setSearchTerm('')
                }
              }}
            >
              Reset to default
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

export default TableHeader
