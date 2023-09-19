import Table from 'old_ui/Table'

import { useRepoBranchContentsTable } from '../hooks'
import { Loader, RepoContentsResult } from '../shared'

function CodeTreeTable() {
  const {
    data,
    headers,
    handleSort,
    isSearching,
    isMissingHeadReport,
    isLoading,
    hasFlagsSelected,
  } = useRepoBranchContentsTable()

  return (
    <div className="flex flex-col gap-4">
      <Table
        data={data}
        columns={headers}
        onSort={handleSort}
        enableHover
        defaultSort={[{ id: 'name', desc: false }]}
      />
      <Loader isLoading={isLoading} />
      {data?.length === 0 && !isLoading ? (
        <RepoContentsResult
          isSearching={isSearching}
          isMissingHeadReport={isMissingHeadReport}
          hasFlagsSelected={hasFlagsSelected}
        />
      ) : null}
    </div>
  )
}

export default CodeTreeTable
