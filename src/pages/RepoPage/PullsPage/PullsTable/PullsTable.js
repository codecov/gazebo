import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import Progress from 'ui/Progress'
import Table from 'ui/Table'
import Avatar from 'ui/Avatar'
import PropTypes from 'prop-types'
import { useOwner } from 'services/user'
import Icon from 'ui/Icon'
import A from 'ui/A'

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

const PullState = ({ state }) => (
  <span className="text-ds-gray-quinary">
    {state === 'MERGED' && <Icon name="merge" variant="developer" size="sm" />}
    {state === 'CLOSED' && (
      <Icon name="pullRequestClosed" variant="developer" size="sm" />
    )}
    {state === 'OPEN' && (
      <Icon name="pullRequestOpen" variant="developer" size="sm" />
    )}
  </span>
)

PullState.propTypes = {
  state: PropTypes.string,
}

const Coverage = ({ pull }) =>
  typeof pull.head?.totals?.coverage === 'number' ? (
    <div className="w-full justify-end flex flex-wrap md:flex-row md:flex-nowrap">
      <PullState state={pull.state} />
      <A to={{ pageName: 'pull', options: { pullid: pull.pullId } }}>
        <span className="mx-6 text-ds-gray-quinary font-mono">
          #{pull.pullId}
        </span>
      </A>
      <Progress amount={pull.head?.totals?.coverage} label={true} />
    </div>
  ) : (
    <div className="w-full justify-end flex flex-wrap md:flex-row md:flex-nowrap">
      <PullState state={pull.state} />
      <A to={{ pageName: 'pull', options: { pullid: pull.pullId } }}>
        <span className="mx-6 text-ds-gray-quinary font-mono">
          #{pull.pullId}
        </span>
      </A>
      <span className="text-ds-gray-quinary text-sm">
        No report uploaded yet
      </span>
    </div>
  )

Coverage.propTypes = {
  pull: PropTypes.object,
}

const Change = ({ pull }) => {
  if (!pull.head?.totals?.coverage) return ''
  const change = pull?.compareWithBase?.patchTotals?.coverage

  return (
    typeof change === 'number' && (
      <div className="flex justify-end w-full font-semibold">
        <span className={change <= 0 ? 'nf bg-red-100' : 'bg-green-100'}>
          {change}%
        </span>
      </div>
    )
  )
}

Change.propTypes = {
  pull: PropTypes.object,
}

const Title = ({ ownerData, pull }) => (
  <div className="flex flex-row">
    <span className="flex items-center mr-6">
      {ownerData && <Avatar user={ownerData} bordered />}
    </span>
    <div className="flex flex-col">
      <A to={{ pageName: 'pull', options: { pullid: pull.pullId } }}>
        <h2 className="font-medium text-sm md:text-base text-black">
          {pull.title}
        </h2>
      </A>
      <p className="text-xs">
        <A to={{ pageName: 'owner' }}>
          <span className="text-black">{pull?.author?.username}</span>
        </A>
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

    return {
      title: <Title ownerData={ownerData} pull={pull} />,
      coverage: <Coverage pull={pull} />,
      change: <Change pull={pull} />,
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
