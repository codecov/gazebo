import { useLocationParams } from 'services/navigation'
import ContentsTableHeader from 'shared/ContentsTable/ContentsTableHeader'
import DisplayTypeButton from 'shared/ContentsTable/DisplayTypeButton'
import MissingFileData from 'shared/ContentsTable/MissingFileData'
import { usePullTreePaths } from 'shared/treePaths'
import Breadcrumb from 'ui/Breadcrumb'
import SearchField from 'ui/SearchField'
import Spinner from 'ui/Spinner'
import Table from 'ui/Table'

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
        defaultSort={[{ id: 'name', desc: false }]}
      />
      {isLoading && <Loader />}
      {data?.length === 0 && !isLoading && (
        <MissingFileData isSearching={isSearching} />
      )}
    </div>
  )
}

export default FileExplorer
