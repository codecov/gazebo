import PropTypes from 'prop-types'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useRepoContents } from 'services/repoContents/hooks'
import A from 'ui/A'
import Icon from 'ui/Icon'
import Progress from 'ui/Progress'
import Spinner from 'ui/Spinner'
import Table from 'ui/Table'

function createTable({ tableData }) {
  return tableData?.map(({ name, percentCovered, type, filepath }) => ({
    name: (
      <div className="flex gap-2 text-ds-gray-quinary">
        <Icon name={type === 'dir' ? 'folder' : 'document'} size="md" />
        <A
          to={{
            pageName: `${type === 'dir' ? 'repoContentsTree' : 'fileViewer'}`,
            options: {
              branch: 'main',
              path: Boolean(filepath) ? `${filepath}/${name}` : name,
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

function RepoContentsTable() {
  const { provider, owner, repo, path, branch } = useParams()
  // TODO: uncomment this line when sorting is enabled
  // const [previousSortBy, setPreviousSortBy] = useState([])
  const { data: repoContents, isLoading } = useRepoContents({
    provider,
    owner,
    repo,
    branch: branch || 'main',
    path: path || '',
  })

  const tableData = useMemo(
    () => createTable({ tableData: repoContents }),
    [repoContents]
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

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center">
        <Spinner size={60} />
      </div>
    )
  }

  return (
    <>
      <Table data={tableData} columns={headers} />
      {repoContents?.length === 0 && (
        <p className="flex justify-center flex-1">
          There was a problem getting repo contents from your provider
        </p>
      )}
    </>
  )
}

RepoContentsTable.propTypes = {
  state: PropTypes.string,
}

export default RepoContentsTable
