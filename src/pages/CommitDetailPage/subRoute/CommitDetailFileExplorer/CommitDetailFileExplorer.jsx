import Table from 'old_ui/Table'
import { useLocationParams } from 'services/navigation'
import ContentsTableHeader from 'shared/ContentsTable/ContentsTableHeader'
import DisplayTypeButton from 'shared/ContentsTable/DisplayTypeButton'
import MissingFileData from 'shared/ContentsTable/MissingFileData'
import { useCommitTreePaths } from 'shared/treePaths'
import Breadcrumb from 'ui/Breadcrumb'
import SearchField from 'ui/SearchField'
import Spinner from 'ui/Spinner'

import { useRepoCommitContentsTable } from './hooks'

import ComponentsSelector from '../ComponentsSelector'

const Loader = () => (
  <div className="flex flex-1 justify-center">
    <Spinner size={60} />
  </div>
)

const defaultQueryParams = {
  search: '',
}

function CommitDetailFileExplorer() {
  const { data, headers, handleSort, isSearching, isLoading } =
    useRepoCommitContentsTable()

  const { params, updateParams } = useLocationParams(defaultQueryParams)
  const { treePaths } = useCommitTreePaths()

  const hasFlagsSelected = params?.flags?.length > 0

  return (
    <div className="mt-2 flex flex-col gap-2">
      <ContentsTableHeader>
        <div className="flex items-center gap-4">
          <DisplayTypeButton />
          <Breadcrumb paths={treePaths} />
        </div>
        <div className="flex gap-2">
          <ComponentsSelector />
          <SearchField
            dataMarketing="commit-files-search"
            placeholder="Search for files"
            searchValue={params?.search}
            setSearchValue={(search) => updateParams({ search })}
          />
        </div>
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
          hasFlagsSelected={hasFlagsSelected}
        />
      )}
    </div>
  )
}

export default CommitDetailFileExplorer
