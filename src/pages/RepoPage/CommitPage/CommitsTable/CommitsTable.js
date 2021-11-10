import PropTypes from 'prop-types'
import Table from 'ui/Table'
import { useOwner } from 'services/user'

const headers = [
  {
    Header: 'Name',
    accessor: 'title',
    width: 'w-5/12',
  },
  {
    Header: (
      <span className="w-full text-right">
        Coverage <span className="ml-36">%</span>
      </span>
    ),
    accessor: 'coverage',
    width: 'w-5/12',
  },
  {
    Header: <span className="w-full text-right">Patch</span>,
    accessor: 'patch',
    width: 'w-1/12',
  },
  {
    Header: <span className="w-full text-right">Change</span>,
    accessor: 'change',
    width: 'w-1/12',
  },
]

const handleOnNull = () => {
  return {
    title: <span className="text-sm">we can&apos;t find this commit</span>,
  }
}

function transformPullToTable(commits) {
  // if there are no repos show empty message
  if (commits.length <= 0) {
    return [
      {
        title: <span className="text-sm">no results found</span>,
      },
    ]
  }

  return commits.map((commit) => {
    if (!commit) return handleOnNull()
    const { data: ownerData } = useOwner({ username: commit?.author?.username })
    console.log(ownerData)

    return {
      title: <span className="flex">something</span>,
      coverage: <span>something to say</span>,
      patch: <span>64</span>,
      change: <span>46</span>,
    }
  })
}

function CommitsTable({ commits }) {
  const dataTable = transformPullToTable(commits)
  return (
    <>
      <Table data={dataTable} columns={headers} />
    </>
  )
}

CommitsTable.propTypes = {
  commits: PropTypes.array,
}

export default CommitsTable
