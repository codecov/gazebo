import PropType from 'prop-types'

import Button from 'ui/Button'
import Spinner from 'ui/Spinner'
import Table from 'ui/Table'

import useRepoContentsTable from './hooks'

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
  isLoading: PropType.bool,
}

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
      <Table
        data={paginatedData}
        columns={headers}
        onSort={handleSort}
        defaultSort={{ id: 'coverage', desc: false }}
      />
      <Loader isLoading={isLoading} />
      {paginatedData?.length === 0 && !isLoading && (
        <p className="flex justify-center flex-1">
          {isSearching
            ? 'No results found'
            : 'There was a problem getting repo contents from your provider'}
        </p>
      )}
      {hasNextPage && (
        <div className="w-full mt-4 flex justify-center">
          <Button hook="load-more" onClick={handlePaginationClick}>
            Load More
          </Button>
        </div>
      )}
    </>
  )
}

export default RepoContentsTable
