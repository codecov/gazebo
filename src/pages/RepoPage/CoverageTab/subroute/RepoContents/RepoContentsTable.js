import PropTypes from 'prop-types'

import Spinner from 'ui/Spinner'
import Table from 'ui/Table'

import { useRepoContentsTable } from './hooks/useRepoContentsTable'

function RepoContentsTable() {
  const { data, headers, isLoading } = useRepoContentsTable()

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center">
        <Spinner size={60} />
      </div>
    )
  }

  return (
    <>
      <Table data={data} columns={headers} />
      {data?.length === 0 && (
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
