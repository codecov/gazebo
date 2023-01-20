import PropTypes from 'prop-types'

import { useLocationParams } from 'services/navigation'
import ContentsTableHeader from 'shared/ContentsTable/ContentsTableHeader'
import DisplayTypeButton from 'shared/ContentsTable/DisplayTypeButton'
import { useRepoCommitContentsTable } from 'shared/ContentsTable/useRepoCommitContentsTable'
import { useCommitTreePaths } from 'shared/treePaths'
import Breadcrumb from 'ui/Breadcrumb'
import SearchField from 'ui/SearchField'
import Spinner from 'ui/Spinner'
import Table from 'ui/Table'

const Loader = () => {
  return (
    <div className="flex-1 flex justify-center">
      <Spinner size={60} />
    </div>
  )
}

const defaultQueryParams = {
  search: '',
}

function MissingFileData({ isSearching }) {
  if (isSearching) {
    return <p className="flex justify-center flex-1">No results found</p>
  }

  return (
    <p className="flex justify-center flex-1">
      There was a problem getting repo contents from your provider
    </p>
  )
}

MissingFileData.propTypes = {
  isSearching: PropTypes.bool,
}

function FileExplorer() {
  const { data, headers, handleSort, isSearching, isLoading } =
    useRepoCommitContentsTable()

  const { params, updateParams } = useLocationParams(defaultQueryParams)
  const { treePaths } = useCommitTreePaths()

  return (
    <div className="flex flex-col gap-2 mt-2">
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
        defaultSort={[{ id: 'name', desc: false }]}
        enableHover={true}
      />
      {isLoading && <Loader />}
      {data?.length === 0 && !isLoading && (
        <MissingFileData isSearching={isSearching} />
      )}
    </div>
  )
}

export default FileExplorer
