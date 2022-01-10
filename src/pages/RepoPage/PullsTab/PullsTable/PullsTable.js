import Table from 'ui/Table'
import PropTypes from 'prop-types'
import Coverage from './Coverage'
import Change from './Change'
import Title from './Title'
import { PullRequestType } from '../types'

const headers = [
  {
    Header: 'Name',
    accessor: 'title',
    width: 'w-6/12',
  },
  {
    Header: (
      <span className="w-full text-right">
        Coverage on <span className="font-light">HEAD</span>
      </span>
    ),
    accessor: 'coverage',
    width: 'w-3/12',
  },
  {
    Header: (
      <span className="w-full text-sm text-right">
        Change from <span className="font-light">BASE</span>
      </span>
    ),
    accessor: 'change',
    width: 'w-3/12',
  },
]

const handleOnNull = () => {
  return {
    title: <span className="text-sm">we can&apos;t find this pull</span>,
  }
}

function transformPullToTable(pulls) {
  // if there are no repos show empty message
  if (pulls.length <= 0) {
    return [
      {
        title: <span className="text-sm">no results found</span>,
      },
    ]
  }

  return pulls.map((pullNode) => {
    if (!pullNode) return handleOnNull()
    const pull = pullNode.node
    const { author, compareWithBase, head, pullId, state, title, updatestamp } =
      pull

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
      change: <Change head={head} compareWithBase={compareWithBase} />,
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
