import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { usePulls } from 'services/pulls'
import Button from 'ui/Button'
import Spinner from 'ui/Spinner'
import Table from 'ui/Table'
import TotalsNumber from 'ui/TotalsNumber'

import Coverage from './Coverage'
import Title from './Title'

import { orderingEnum } from '../enums'
import { PullRequestType } from '../types'

const headers = [
  {
    id: 'title',
    header: 'Name',
    accessorKey: 'title',
    width: 'w-6/12',
    cell: (info) => info.getValue(),
    justifyStart: true,
  },
  {
    id: 'coverage',
    header: (
      <>
        Coverage on <span className="font-light ml-1">HEAD</span>
      </>
    ),
    accessorKey: 'coverage',
    width: 'w-3/12 justify-end',
    cell: (info) => info.getValue(),
  },
  {
    id: 'change',
    header: (
      <>
        Change from <span className="font-light ml-1">BASE</span>
      </>
    ),
    accessorKey: 'change',
    width: 'w-3/12 justify-end',
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

function transformPullToTable(pulls, isLoading) {
  // if the data is loading do not return anything
  if (isLoading) return []

  // if there are no repos show empty message
  if (pulls?.length <= 0) {
    return [
      {
        title: <span className="text-sm">no results found</span>,
        coverage: null,
        change: null,
      },
    ]
  }

  return pulls?.map((pullNode) => {
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
        <TotalsNumber value={change} showChange data-testid="change-value" />
      ),
    }
  })
}

const Loader = ({ isLoading }) => {
  return (
    isLoading && (
      <div className="flex-1 flex justify-center">
        <Spinner size={60} />
      </div>
    )
  )
}

Loader.propTypes = {
  isLoading: PropTypes.bool,
}

const defaultParams = {
  order: orderingEnum.Newest.order,
  prStates: [],
}

function PullsTab() {
  const { provider, owner, repo } = useParams()
  const { params } = useLocationParams(defaultParams)
  const { order, prStates } = params

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePulls({
      provider,
      owner,
      repo,
      filters: {
        state: prStates,
      },
      orderingDirection: order,
      options: {
        suspense: false,
      },
    })

  const pulls = data?.pulls ? data?.pulls : []

  const dataTable = transformPullToTable(pulls, isLoading)

  return (
    <>
      <Table data={dataTable} columns={headers} />
      <Loader isLoading={isLoading} />
      {hasNextPage && (
        <div className="flex-1 mt-4 flex justify-center">
          <Button
            hook="load-more"
            isLoading={isFetchingNextPage}
            onClick={fetchNextPage}
          >
            Load More
          </Button>
        </div>
      )}
    </>
  )
}

PullsTab.propTypes = {
  pulls: PropTypes.arrayOf(
    PropTypes.shape({
      node: PullRequestType,
    })
  ),
}

export default PullsTab
