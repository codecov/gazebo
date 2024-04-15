import ToggleHeader from 'pages/PullRequestPage/Header/ToggleHeader/ToggleHeader'
import { useLocationParams } from 'services/navigation'
import DisplayTypeButton from 'shared/ContentsTable/DisplayTypeButton'
import { usePullTreePaths } from 'shared/treePaths'
import Breadcrumb from 'ui/Breadcrumb'
import SearchField from 'ui/SearchField'

import FileExplorerTable from './FileExplorerTable'

const defaultQueryParams = {
  search: '',
}

function FileExplorer() {
  const {
    params,
    updateParams,
  }: {
    params: { search?: string }
    updateParams: (params: Record<string, string>) => void
  } = useLocationParams(defaultQueryParams)
  const { treePaths } = usePullTreePaths()

  return (
    <div className="mt-2 flex flex-col">
      <div className="flex flex-wrap justify-between border-b pb-2">
        <div className="flex items-center gap-4">
          <DisplayTypeButton />
          <Breadcrumb paths={treePaths} />
        </div>
        <div className="flex gap-2">
          <SearchField
            // @ts-expect-error
            dataMarketing="pull-files-search"
            placeholder="Search for files"
            searchValue={params?.search}
            setSearchValue={(search: string) => updateParams({ search })}
          />
        </div>
      </div>
      <ToggleHeader noBottomBorder showHitCount />
      <FileExplorerTable />
    </div>
  )
}

export default FileExplorer
