import PropType from 'prop-types'

import { useLocationParams } from 'services/navigation'
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
      <div className="flex justify-between gap-2 py-2 sticky top-[4.5rem] bg-white">
        <div className="flex-1 flex gap-4">
          <DisplayTypeButton dataLength={data?.length} isLoading={isLoading} />
          <FileBreadcrumb />
        </div>
        <SearchField
          dataMarketing="files-search"
          placeholder="Search for files"
          searchValue={params?.search}
          setSearchValue={(search) => updateParams({ search })}
        />
      </div>
      <div className=" flex-1 grid grid-cols-12 gap-8">
        <div className="flex flex-col col-span-12 md:col-span-12">
          <Table
            data={data}
            columns={headers}
            onSort={handleSort}
            enableHover
          />
          <div className="mt-4">
            <Loader isLoading={isLoading} />
            {data?.length === 0 && !isLoading && (
              <RepoContentsResult
                isSearching={isSearching}
                isMissingHeadReport={isMissingHeadReport}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default RepoContentsTable
