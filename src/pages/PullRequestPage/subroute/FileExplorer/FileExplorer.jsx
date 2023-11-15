import qs from 'qs'
import { useLocation } from 'react-router-dom'

import Table from 'old_ui/Table'
import { useLocationParams } from 'services/navigation'
import ContentsTableHeader from 'shared/ContentsTable/ContentsTableHeader'
import DisplayTypeButton from 'shared/ContentsTable/DisplayTypeButton'
import MissingFileData from 'shared/ContentsTable/MissingFileData'
import { usePullTreePaths } from 'shared/treePaths'
import Breadcrumb from 'ui/Breadcrumb'
import SearchField from 'ui/SearchField'
import Spinner from 'ui/Spinner'

import { useRepoPullContentsTable } from './hooks'

const Loader = () => (
  <div className="flex flex-1 justify-center">
    <Spinner size={60} />
  </div>
)

const defaultQueryParams = {
  search: '',
}

function FileExplorer() {
  const { data, headers, handleSort, isSearching, isLoading } =
    useRepoPullContentsTable()
  const location = useLocation()
  const queryParams = qs.parse(location.search, {
    ignoreQueryPrefix: true,
    depth: 1,
  })
  const flags = queryParams?.flags

  const { params, updateParams } = useLocationParams(defaultQueryParams)
  const { treePaths } = usePullTreePaths()

  return (
    <div className="mt-2 flex flex-col gap-2">
      <ContentsTableHeader>
        <div className="flex items-center gap-4">
          <DisplayTypeButton />
          <Breadcrumb paths={treePaths} />
        </div>
        <SearchField
          dataMarketing="pull-files-search"
          placeholder="Search for files"
          searchValue={params?.search}
          setSearchValue={(search) => updateParams({ search })}
        />
      </ContentsTableHeader>
      <Table
        data={data}
        columns={headers}
        onSort={handleSort}
        enableHover={true}
      />
      {isLoading && <Loader />}
      {data?.length === 0 && !isLoading && (
        <MissingFileData
          isSearching={isSearching}
          hasFlagsSelected={flags?.length > 0}
        />
      )}
    </div>
  )
}

export default FileExplorer
