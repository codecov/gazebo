import { useLocationParams } from 'services/navigation'
import DisplayTypeButton from 'shared/ContentsTable/DisplayTypeButton'
import FileBreadcrumb from 'shared/ContentsTable/FileBreadcrumb'
import SearchField from 'ui/SearchField'

import CodeTreeTable from './CodeTreeTable'
import FileListTable from './FileListTable'
import { useRepoBranchContentsTable } from './hooks'

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
  const isCodeTreeDisplay = params?.displayType === 'tree'

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
        {isCodeTreeDisplay ? (
          <CodeTreeTable
            data={data}
            headers={headers}
            handleSort={handleSort}
            isSearching={isSearching}
            isMissingHeadReport={isMissingHeadReport}
            isLoading={isLoading}
          />
        ) : (
          <FileListTable
            data={data}
            headers={headers}
            handleSort={handleSort}
            isSearching={isSearching}
            isMissingHeadReport={isMissingHeadReport}
            isLoading={isLoading}
          />
        )}
      </div>
    </>
  )
}

export default FileExplorer
