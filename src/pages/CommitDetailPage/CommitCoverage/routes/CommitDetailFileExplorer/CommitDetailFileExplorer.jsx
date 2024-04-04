import Table from 'old_ui/Table'
import ToggleHeader from 'pages/CommitDetailPage/Header/ToggleHeader/ToggleHeader'
import { useLocationParams } from 'services/navigation'
import ContentsTableHeader from 'shared/ContentsTable/ContentsTableHeader'
import DisplayTypeButton from 'shared/ContentsTable/DisplayTypeButton'
import MissingFileData from 'shared/ContentsTable/MissingFileData'
import { useCommitTreePaths } from 'shared/treePaths'
import Breadcrumb from 'ui/Breadcrumb'
import SearchField from 'ui/SearchField'
import Spinner from 'ui/Spinner'

import { useRepoCommitContentsTable } from './hooks'

const Loader = () => (
  <div className="flex flex-1 justify-center">
    <Spinner size={60} />
  </div>
)

const defaultQueryParams = {
  search: '',
}

function CommitDetailFileExplorer() {
  const {
    data,
    headers,
    handleSort,
    isSearching,
    isLoading,
    pathContentsType,
  } = useRepoCommitContentsTable()

  const { params, updateParams } = useLocationParams(defaultQueryParams)
  const { treePaths } = useCommitTreePaths()

  const hasFlagsSelected = params?.flags?.length > 0
  const hasComponentsSelected = params?.components?.length > 0
  if (pathContentsType === 'UnknownPath') {
    return (
      <p className="m-4">
        Unknown filepath. Please ensure that files/directories exist and are not
        empty.
      </p>
    )
  }

  if (pathContentsType === 'MissingCoverage') {
    return <p className="m-4">No coverage data available.</p>
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      <ContentsTableHeader>
        <div className="flex items-center gap-4">
          <DisplayTypeButton />
          <Breadcrumb paths={treePaths} />
        </div>
        <div className="flex gap-2">
          <SearchField
            dataMarketing="commit-files-search"
            placeholder="Search for files"
            searchValue={params?.search}
            setSearchValue={(search) => updateParams({ search })}
          />
        </div>
      </ContentsTableHeader>
      <div className="border-t border-ds-gray-tertiary">
        <ToggleHeader noBottomBorder />
        <Table
          data={data}
          columns={headers}
          onSort={handleSort}
          enableHover={true}
        />
      </div>
      {isLoading && <Loader />}
      {data?.length === 0 && !isLoading && (
        <MissingFileData
          isSearching={isSearching}
          hasFlagsSelected={hasFlagsSelected}
          hasComponentsSelected={hasComponentsSelected}
        />
      )}
    </div>
  )
}

export default CommitDetailFileExplorer
