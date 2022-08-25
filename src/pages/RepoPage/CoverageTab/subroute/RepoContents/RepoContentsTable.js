import Spinner from 'ui/Spinner'
import Table from 'ui/Table'

import useRepoContentsTable from './hooks'

const Loader = () => (
  <div className="flex-1 flex justify-center">
    <Spinner size={60} />
  </div>
)

function RepoContentsTable() {
  const { data, headers, handleSort, isLoading, isSearching } =
    useRepoContentsTable()

  return (
    <>
      <Table data={data} columns={headers} onSort={handleSort} />
      {isLoading && <Loader />}
      {data?.length === 0 && !isLoading && (
        <p className="flex justify-center flex-1">
          {isSearching
            ? 'No results found'
            : 'There was a problem getting repo contents from your provider'}
        </p>
      )}
    </>
  )
}

export default RepoContentsTable
