import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import Progress from 'ui/Progress'
import Table from 'ui/Table'
import Avatar from 'ui/Avatar'
import PropTypes from 'prop-types'
import { useOwner } from 'services/user'
import Icon from 'ui/Icon'

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

const Coverage = ({ pull }) =>
  typeof pull.head?.totals?.coverage === 'number' ? (
    <div className="w-full justify-end flex flex-wrap md:flex-row md:flex-nowrap">
      {pull.state === 'MERGED' && (
        <span className="text-ds-primary-green">
          <Icon name="check" variant="solid" />
        </span>
      )}
      {pull.state === 'CLOSE' && (
        <span className="text-ds-primary-red">
          <Icon name="x" variant="solid" />
        </span>
      )}
      {pull.state === 'OPEN' && (
        <span>
          <Icon name="lockClosed" variant="solid" />
        </span>
      )}
      <span className="mx-6 text-ds-gray-quinary">#{pull.pullId}</span>
      <Progress amount={pull.head?.totals?.coverage} label={true} />
    </div>
  ) : (
    <div className="w-full justify-end flex flex-wrap md:flex-row md:flex-nowrap">
      <span className="text-ds-primary-red">
        <Icon name="x" variant="solid" />
      </span>
      <span className="mx-6 text-ds-gray-quinary">#{pull.pullId}</span>
      <span className="text-ds-gray-quinary text-sm">
        No report uploaded yet
      </span>
    </div>
  )

Coverage.propTypes = {
  pull: PropTypes.object,
}

const Change = ({ change }) =>
  !isNaN(change) && (
    <div className="flex justify-end w-full font-semibold">
      <span className={change <= 0 ? 'nf bg-red-100' : 'bg-green-100'}>
        {change}%
      </span>
    </div>
  )

Change.propTypes = {
  change: PropTypes.number,
}

const Title = ({ ownerData, pull }) => (
  <div className="flex flex-row">
    <span className="flex items-center mr-6">
      {ownerData && <Avatar user={ownerData} bordered />}
    </span>
    <div className="flex flex-col">
      <h2 className="font-medium text-sm md:text-base">{pull.title}</h2>
      <p className="text-xs">
        {pull?.author?.username}
        {pull?.updatestamp && (
          <span className="text-ds-gray-quinary">
            {' opened ' +
              formatDistanceToNow(new Date(pull.updatestamp), {
                addSuffix: true,
              })}
          </span>
        )}
      </p>
    </div>
  </div>
)

Title.propTypes = {
  ownerData: PropTypes.object,
  pull: PropTypes.object,
}

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
    if (!pullNode) return handleOnNull() //does the production api return null vals?
    const pull = pullNode.node
    const { data: ownerData } = useOwner({ username: pull?.author?.username })
    const change =
      pull?.head?.totals?.coverage -
      pull?.compareWithBase?.patchTotals?.coverage

    return {
      title: <Title ownerData={ownerData} pull={pull} />,
      coverage: <Coverage pull={pull} />,
      change: <Change change={change} />,
    }
  })
}

function PullsPage({ pulls }) {
  const dataTable = transformPullToTable(pulls)
  return (
    <>
      <Table data={dataTable} columns={headers} />
    </>
  )
}

PullsPage.propTypes = {
  pulls: PropTypes.array,
}

export default PullsPage
