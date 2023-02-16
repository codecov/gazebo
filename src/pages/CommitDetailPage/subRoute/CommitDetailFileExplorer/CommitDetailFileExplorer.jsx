import { useLocationParams } from 'services/navigation'
import ContentsTableHeader from 'shared/ContentsTable/ContentsTableHeader'
import DisplayTypeButton from 'shared/ContentsTable/DisplayTypeButton'
import MissingFileData from 'shared/ContentsTable/MissingFileData'
import { useRepoCommitContentsTable } from 'shared/ContentsTable/useRepoCommitContentsTable'
import { useCommitTreePaths } from 'shared/treePaths'
import Breadcrumb from 'ui/Breadcrumb'
import SearchField from 'ui/SearchField'
import Spinner from 'ui/Spinner'
import Table from 'ui/Table'

const Loader = () => {
  return (
    <div className="flex flex-1 justify-center">
      <Spinner size={60} />
    </div>
  )
}

const defaultQueryParams = {
  search: '',
}

function CommitDetailFileExplorer() {
  const { data, headers, handleSort, isSearching, isLoading } =
    useRepoCommitContentsTable()

  const { params, updateParams } = useLocationParams(defaultQueryParams)
  const { treePaths } = useCommitTreePaths()

  return (
    <div className="mt-2 flex flex-col gap-2">
      <ContentsTableHeader>
        <div className="flex gap-4">
          <DisplayTypeButton />
          <Breadcrumb paths={treePaths} />
        </div>
        <SearchField
          dataMarketing="commit-files-search"
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
        <MissingFileData isSearching={isSearching} />
      )}
    </div>
  )
}

export default CommitDetailFileExplorer
