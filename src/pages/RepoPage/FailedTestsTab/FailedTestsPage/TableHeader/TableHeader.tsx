import { useState } from 'react'

import { useLocationParams } from 'services/navigation'
import Button from 'ui/Button'
import SearchField from 'ui/SearchField'

import { defaultQueryParams } from '../SelectorSection'

const TableHeader = () => {
  const { params, updateParams } = useLocationParams(defaultQueryParams)
  // @ts-expect-error, useLocationParams needs to be updated to have full types
  const [searchTerm, setSearchTerm] = useState(params.term || '')

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
        <h2 className="text-lg font-semibold">Tests (50K)</h2>
        <div className="flex items-center gap-2">
          <SearchField
            // @ts-expect-error, component is not typed
            dataMarketing="search-failed-tests"
            placeholder="Search by name"
            searchValue={searchTerm}
            setSearchValue={handleSearchChange}
            data-testid="search-input-failed-tests"
          />
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
        </div>
      </div>
    </>
  )
}

export default TableHeader
