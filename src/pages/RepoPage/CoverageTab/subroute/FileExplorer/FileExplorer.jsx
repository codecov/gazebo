import PropType from 'prop-types'

import { useLocationParams } from 'services/navigation'
import DisplayTypeButton from 'shared/ContentsTable/DisplayTypeButton'
import FileBreadcrumb from 'shared/ContentsTable/FileBreadcrumb'
import MissingFileData from 'shared/ContentsTable/MissingFileData'
import SearchField from 'ui/SearchField'
import Spinner from 'ui/Spinner'
import Table from 'ui/Table'

import { useRepoBranchContentsTable } from './hooks'

const Loader = ({ isLoading }) => {
  return (
    isLoading && (
      <div className="flex flex-1 justify-center">
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
      <p className="flex flex-1 justify-center">
        No coverage report uploaded for this branch head commit
      </p>
    )
  }

  return <MissingFileData isSearching={isSearching} />
}

RepoContentsResult.propTypes = {
  isSearching: PropType.bool,
  isMissingHeadReport: PropType.bool,
}

const defaultQueryParams = {
  search: '',
}

function FileExplorer() {
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
      <div className="sticky top-[4.5rem] flex justify-between gap-2 bg-white pt-2">
        <div className="flex flex-1 items-center gap-4">
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
      <div className=" grid flex-1 grid-cols-12 gap-8">
        <div className="col-span-12 flex flex-col md:col-span-12">
          <Table
            data={data}
            columns={headers}
            defaultSort={[{ id: 'misses', desc: true }]}
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

export default FileExplorer
