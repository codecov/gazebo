import Table from 'old_ui/Table'

import { useRepoBranchContentsTable } from '../hooks'
import { Loader, RepoContentsResult } from '../shared'

function FileListTable() {
  const {
    data,
    headers,
    handleSort,
    isSearching,
    isMissingHeadReport,
    isLoading,
    hasFlagsSelected,
    hasComponentsSelected,
    pathContentsType,
  } = useRepoBranchContentsTable()

  if (pathContentsType === 'UnknownPath') {
    return (
      <p className="m-4">
        Unknown filepath. Please ensure that files/directories exist and are not
        empty.
      </p>
    )
  }

  if (pathContentsType === 'MissingCoverage') {
    return <p className="m-4">No coverage data available.</p>
  }

  return (
    <div className="col-span-12 flex flex-col gap-4">
      <Table
        data={data}
        columns={headers}
        onSort={handleSort}
        enableHover
        defaultSort={[{ id: 'misses', desc: true }]}
      />
      <Loader isLoading={isLoading} />
      {data?.length === 0 && !isLoading ? (
        <RepoContentsResult
          isSearching={isSearching}
          isMissingHeadReport={isMissingHeadReport}
          hasFlagsSelected={hasFlagsSelected}
          hasComponentsSelected={hasComponentsSelected}
        />
      ) : null}
    </div>
  )
}

export default FileListTable
