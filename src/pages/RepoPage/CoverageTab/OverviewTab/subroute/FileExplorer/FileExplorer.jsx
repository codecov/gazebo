import { useLocationParams } from 'services/navigation'
import DisplayTypeButton from 'shared/ContentsTable/DisplayTypeButton'
import FileBreadcrumb from 'shared/ContentsTable/FileBreadcrumb'
import SearchField from 'ui/SearchField'

import CodeTreeTable from './CodeTreeTable'
import FileListTable from './FileListTable'
import FlagMultiSelect from './FlagMultiSelect'
import { useRepoBranchContentsTable } from './hooks'

import ComponentsSelectCoverage from '../ComponentsMultiSelect'

const defaultQueryParams = {
  search: '',
}

function FileExplorer() {
  const { params, updateParams } = useLocationParams(defaultQueryParams)
  const isFileListDisplay = params?.displayType === 'list'

  const { data: branchData, isLoading: branchIsLoading } =
    useRepoBranchContentsTable()

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-0 z-10 flex justify-between gap-2 bg-ds-background pt-2">
        <div className="flex flex-1 items-center gap-4">
          <DisplayTypeButton
            dataLength={branchData?.length}
            isLoading={branchIsLoading}
          />
          <FileBreadcrumb />
        </div>
        <FlagMultiSelect />
        <ComponentsSelectCoverage />
        <SearchField
          dataMarketing="files-search"
          placeholder="Search for files"
          searchValue={params?.search}
          setSearchValue={(search) => updateParams({ search })}
        />
      </div>
      <div className="flex flex-col gap-8">
        {isFileListDisplay ? <FileListTable /> : <CodeTreeTable />}
      </div>
    </div>
  )
}

export default FileExplorer
