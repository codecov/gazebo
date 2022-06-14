import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useRepoOverview } from 'services/repo'
import { useRepoContents } from 'services/repoContents/hooks'
import A from 'ui/A'
import Icon from 'ui/Icon'
import Progress from 'ui/Progress'

function createTable({ tableData, branch, path }) {
  return tableData?.length > 0
    ? tableData.map(({ name, percentCovered, type }) => ({
        name: (
          <div className="flex gap-2 text-ds-gray-quinary">
            <Icon name={type === 'dir' ? 'folder' : 'document'} size="md" />
            <A
              to={{
                pageName: `${type === 'dir' ? 'treeView' : 'fileViewer'}`,
                options: {
                  ref: branch,
                  tree: Boolean(path) ? `${path}/${name}` : name,
                },
              }}
            >
              {name}
            </A>
          </div>
        ),
        coverage: (
          <div className="flex flex-1 gap-2 items-center">
            <Progress amount={percentCovered} label />
          </div>
        ),
      }))
    : []
}

const headers = [
  {
    Header: 'Files',
    accessor: 'name',
    width: 'w-9/12 min-w-min',
  },
  {
    Header: (
      <span className="w-full text-right">
        <span className="font-mono">HEAD</span> file coverage %
      </span>
    ),
    accessor: 'coverage',
    width: 'w-3/12 min-w-min',
  },
]

export function useRepoContentsTable() {
  const { provider, owner, repo, path, branch } = useParams()
  // TODO: uncomment this line when sorting is enabled
  // const [previousSortBy, setPreviousSortBy] = useState([])
  const { data: repoOverview, isLoadingRepo } = useRepoOverview({
    provider,
    repo,
    owner,
  })

  const { defaultBranch } = repoOverview

  const { data: repoContents, isLoading } = useRepoContents({
    provider,
    owner,
    repo,
    branch: branch || defaultBranch,
    path: path || '',
  })

  const data = useMemo(
    () =>
      createTable({
        tableData: repoContents,
        branch: branch || defaultBranch,
        path,
      }),
    [repoContents, branch, defaultBranch, path]
  )

  // TODO: Enable sorting
  // const handleSort = useCallback(
  //   (sortBy) => {
  //     if (!isEqual(previousSortBy, sortBy)) {
  //       console.log('SORT')
  //       setPreviousSortBy(sortBy)
  //     }
  //   },
  //   [previousSortBy]
  // )

  return {
    data,
    headers,
    isLoading: isLoadingRepo || isLoading,
  }
}
