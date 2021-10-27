import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import Progress from 'ui/Progress'
import Table from 'ui/Table'
import AppLink from 'shared/AppLink'
import Avatar from 'ui/Avatar'
import PropTypes from 'prop-types'

const headers = [
  {
    Header: 'Name',
    accessor: 'title',
    width: 'w-7/12',
  },
  {
    Header: <span className="w-full text-right">Coverge on Head</span>,
    accessor: 'coverage',
    width: 'w-2/12',
  },
  {
    Header: <span className="w-full text-sm text-right">Change from Base</span>,
    accessor: 'change',
    width: 'w-3/12',
  },
]

function transformPullToTable(pulls, owner) {
  // if there are no repos show empty message
  if (pulls.length <= 0) {
    return [
      {
        title: <span className="text-sm">no results found</span>,
      },
    ]
  }

  // if we have an owner, then we don't need to show it on the repo title
  // const showRepoOwner = !owner

  return pulls.map((pull) => ({
    title: (
      <div className="flex flex-col">
        <div className="flex flex-row">
          <Avatar user={owner} bordered />
          <AppLink to={{ pageName: '' }} className={''}>
            {pull.title}
          </AppLink>
        </div>
        <div className="w-full text-right text-ds-gray-quinary flex flex-row">
          <span className="text-xs">{pull.author?.username + 'opened'}</span>
          <span>
            {pull.updatestamp
              ? formatDistanceToNow(new Date(pull.updatestamp), {
                  addSuffix: true,
                })
              : ''}
          </span>
        </div>
      </div>
    ),
    coverage:
      typeof pull.head?.totals?.coverage === 'number' ? (
        <div className="w-80 max-w-xs text-right flex flex-row">
          <div>icon</div>
          <div className="">#{pull.pullId}</div>
          <Progress amount={pull.head?.totals?.coverage} label={true} />
        </div>
      ) : (
        <span className="text-ds-gray-quinary text-sm">No data available</span>
      ),
    change: <div>{pull.head.totals.coverage - pull.base.totals.coverage}%</div>,
  }))
}

function PullsPage({ pulls, owner }) {
  const dataTable = transformPullToTable(pulls, owner)
  return (
    <>
      <Table data={dataTable} columns={headers} />
    </>
  )
}

PullsPage.propTypes = {
  pulls: PropTypes.array,
  owner: PropTypes.string,
}

export default PullsPage
