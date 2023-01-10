import PropType from 'prop-types'

import { useLocationParams } from 'services/navigation'
import ContentsTableHeader from 'shared/ContentsTable/ContentsTableHeader'
import DisplayTypeButton from 'shared/ContentsTable/DisplayTypeButton'
import FileBreadcrumb from 'shared/ContentsTable/FileBreadcrumb'
import { useRepoBranchContentsTable } from 'shared/ContentsTable/useRepoBranchContentsTable'
import SearchField from 'ui/SearchField'
import Spinner from 'ui/Spinner'
import Table from 'ui/Table'

const Loader = ({ isLoading }) => {
  return (
    isLoading && (
      <div className="flex-1 flex justify-center">
        <Spinner size={60} />
      </div>
    )
  )
}

Loader.propTypes = {
  isLoading: PropType.bool,
}

function RepoContentsResult({ isSearching, isMissingHeadReport }) {
  if (isMissingHeadReport) {
    return (
      <p className="flex justify-center flex-1">
        No coverage report uploaded for this branch head commit
      </p>
    )
  } else if (isSearching) {
    return <p className="flex justify-center flex-1">No results found</p>
  } else {
    return (
      <p className="flex justify-center flex-1">
        There was a problem getting repo contents from your provider
      </p>
    )
  }
}

RepoContentsResult.propTypes = {
  isSearching: PropType.bool,
  isMissingHeadReport: PropType.bool,
}

const defaultQueryParams = {
  search: '',
}

function RepoContentsTable() {
  const {
    data,
    headers,
    handleSort,
    isSearching,
    isMissingHeadReport,
    isLoading,
  } = useRepoBranchContentsTable()

  const { params, updateParams } = useLocationParams(defaultQueryParams)

  return (
    <>
      <ContentsTableHeader>
        <div className="flex gap-4">
          <DisplayTypeButton dataLength={data?.length} isLoading={isLoading} />
          <FileBreadcrumb />
        </div>
        <SearchField
          dataMarketing="files-search"
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
      <Loader isLoading={isLoading} />
      {data?.length === 0 && !isLoading && (
        <RepoContentsResult
          isSearching={isSearching}
          isMissingHeadReport={isMissingHeadReport}
        />
      )}
    </>
  )
}

export default RepoContentsTable
