import { useLocationParams } from 'services/navigation'
import ContentsTableHeader from 'shared/ContentsTable/ContentsTableHeader'
import DisplayTypeButton from 'shared/ContentsTable/DisplayTypeButton'
import { usePullTreePaths } from 'shared/treePaths'
import Breadcrumb from 'ui/Breadcrumb'
import SearchField from 'ui/SearchField'

import FileExplorerTable from './FileExplorerTable'

import ComponentsSelector from '../ComponentsSelector'

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
    <div className="mt-2 flex flex-col gap-2">
      <ContentsTableHeader>
        <div className="flex items-center gap-4">
          <DisplayTypeButton />
          <Breadcrumb paths={treePaths} />
        </div>
        <div className="flex gap-2">
          <ComponentsSelector />
          <SearchField
            // @ts-expect-error
            dataMarketing="pull-files-search"
            placeholder="Search for files"
            searchValue={params?.search}
            setSearchValue={(search: string) => updateParams({ search })}
          />
        </div>
      </ContentsTableHeader>
      <FileExplorerTable />
    </div>
  )
}

export default FileExplorer
