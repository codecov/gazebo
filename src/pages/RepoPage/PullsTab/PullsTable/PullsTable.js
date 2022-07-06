import PropTypes from 'prop-types'

import Table from 'ui/Table'
import TotalsNumber from 'ui/TotalsNumber'

import Coverage from './Coverage'
import Title from './Title'

import { PullRequestType } from '../types'

const headers = [
  {
    id: 'title',
    header: 'Name',
    accessorKey: 'title',
    width: 'w-6/12',
    cell: (info) => info.getValue(),
  },
  {
    id: 'coverage',
    header: (
      <span className="w-full text-right">
        Coverage on <span className="font-light">HEAD</span>
      </span>
    ),
    accessorKey: 'coverage',
    width: 'w-3/12',
    cell: (info) => info.getValue(),
  },
  {
    id: 'change',
    header: (
      <span className="w-full text-sm text-right">
        Change from <span className="font-light">BASE</span>
      </span>
    ),
    accessorKey: 'change',
    width: 'w-3/12',
    cell: (info) => info.getValue(),
  },
]

const handleOnNull = () => {
  return {
    title: <span className="text-sm">we can&apos;t find this pull</span>,
    coverage: null,
    change: null,
  }
}

function transformPullToTable(pulls) {
  // if there are no repos show empty message
  if (pulls.length <= 0) {
    return [
      {
        title: <span className="text-sm">no results found</span>,
        coverage: null,
        change: null,
      },
    ]
  }

  return pulls.map((pullNode) => {
    if (!pullNode) return handleOnNull()
    const pull = pullNode.node
    const { author, compareWithBase, head, pullId, state, title, updatestamp } =
      pull

    const change = compareWithBase?.changeWithParent

    return {
      title: (
        <Title
          author={author}
          pullId={pullId}
          title={title}
          updatestamp={updatestamp}
        />
      ),
      coverage: <Coverage head={head} state={state} pullId={pullId} />,
      change: (
        <div className="w-full flex justify-end">
          <TotalsNumber value={change} showChange data-testid="change-value" />
        </div>
      ),
    }
  })
}

function PullsTab({ pulls }) {
  const dataTable = transformPullToTable(pulls)
  return <Table data={dataTable} columns={headers} />
}

PullsTab.propTypes = {
  pulls: PropTypes.arrayOf(
    PropTypes.shape({
      node: PullRequestType,
    })
  ),
}

export default PullsTab
