import Button from 'ui/Button'
import Spinner from 'ui/Spinner'
import Table from 'ui/Table'

import useRepoContentsTable from './hooks'

const Loader = () => (
  <div className="flex-1 flex justify-center">
    <Spinner size={60} />
  </div>
)

// eslint-disable-next-line complexity
function RepoContentsTable() {
  const {
    paginatedData,
    headers,
    handleSort,
    isLoading,
    isSearching,
    handlePaginationClick,
    hasNextPage,
  } = useRepoContentsTable()

  return (
    <>
      <Table data={paginatedData} columns={headers} onSort={handleSort} />
      {isLoading && <Loader />}
      {paginatedData?.length === 0 && !isLoading && (
        <p className="flex justify-center flex-1">
          {isSearching
            ? 'No results found'
            : 'There was a problem getting repo contents from your provider'}
        </p>
      )}
      {hasNextPage && (
        <div className="w-full mt-4 flex justify-center">
          <Button
            hook="load-more"
            variant="primary"
            onClick={handlePaginationClick}
          >
            Load More
          </Button>
        </div>
      )}
    </>
  )
}

export default RepoContentsTable
