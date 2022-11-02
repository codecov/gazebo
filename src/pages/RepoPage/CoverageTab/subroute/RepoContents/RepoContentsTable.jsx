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

function RepoContentsResult({ isSearching, isMissingHeadReport }) {
  if (isMissingHeadReport) {
    return (
      <p className="flex justify-center flex-1">
        No coverage report uploaded for this branch head commit
      </p>
    )
  } else if (isSearching) {
    return <p className="flex justify-center flex-1">No results found</p>
  } else {
    return (
      <p className="flex justify-center flex-1">
        There was a problem getting repo contents from your provider
      </p>
    )
  }
}

RepoContentsResult.propTypes = {
  isSearching: PropType.bool,
  isMissingHeadReport: PropType.bool,
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
    isMissingHeadReport,
  } = useRepoContentsTable()

  return (
    <>
      <Table data={paginatedData} columns={headers} onSort={handleSort} />
      <Loader isLoading={isLoading} />
      {paginatedData?.length === 0 && !isLoading && (
        <RepoContentsResult
          isSearching={isSearching}
          isMissingHeadReport={isMissingHeadReport}
        />
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
