import PropTypes from 'prop-types'

import Spinner from 'ui/Spinner'
import Table from 'ui/Table'

import useRepoContentsTable from './hooks'

function RepoContentsTable() {
  const { data, headers, handleSort, isLoading, isSearching } =
    useRepoContentsTable()

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center">
        <Spinner size={60} />
      </div>
    )
  }

  return (
    <>
      <Table data={data} columns={headers} onSort={handleSort} />
      {data?.length === 0 && (
        <p className="flex justify-center flex-1">
          {isSearching
            ? 'No results found'
            : 'There was a problem getting repo contents from your provider'}
        </p>
      )}
    </>
  )
}

RepoContentsTable.propTypes = {
  state: PropTypes.string,
}

export default RepoContentsTable
