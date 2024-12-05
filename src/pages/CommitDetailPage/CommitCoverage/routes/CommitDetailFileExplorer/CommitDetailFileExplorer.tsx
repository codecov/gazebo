import ToggleHeader from 'pages/CommitDetailPage/Header/ToggleHeader/ToggleHeader'
import { useLocationParams } from 'services/navigation'
import ContentsTableHeader from 'shared/ContentsTable/ContentsTableHeader'
import DisplayTypeButton from 'shared/ContentsTable/DisplayTypeButton'
import { useCommitTreePaths } from 'shared/treePaths'
import Breadcrumb from 'ui/Breadcrumb'
import SearchField from 'ui/SearchField'

import CommitDetailFileExplorerTable from './CommitDetailFileExplorerTable'

const defaultQueryParams = {
  search: '',
}

function CommitDetailFileExplorer() {
  const {
    params,
    updateParams,
  }: {
    params: { search?: string }
    updateParams: (params: Record<string, string>) => void
  } = useLocationParams(defaultQueryParams)
  const { treePaths } = useCommitTreePaths()

  return (
    <div className="mt-2 flex flex-col gap-2">
      <ContentsTableHeader>
        <div className="flex items-center gap-4">
          <DisplayTypeButton />
          <Breadcrumb paths={treePaths} />
        </div>
        <div className="flex gap-2">
          <SearchField
            // @ts-expect-error - SearchField hasn't been typed yet
            dataMarketing="commit-files-search"
            placeholder="Search for files"
            searchValue={params?.search}
            setSearchValue={(search: string) => updateParams({ search })}
          />
        </div>
      </ContentsTableHeader>
      <div className="border-t border-ds-gray-tertiary">
        <ToggleHeader noBottomBorder />
        <CommitDetailFileExplorerTable />
      </div>
    </div>
  )
}

export default CommitDetailFileExplorer
