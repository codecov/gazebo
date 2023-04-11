import Table from 'ui/Table'

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
  } = useRepoBranchContentsTable()

  return (
    <div className="col-span-12 flex flex-col md:col-span-12">
      <Table
        data={data}
        columns={headers}
        onSort={handleSort}
        enableHover
        defaultSort={[{ id: 'name', desc: false }]}
      />
      <div className="mt-4">
        <Loader isLoading={isLoading} />
        {data?.length === 0 && !isLoading && (
          <RepoContentsResult
            isSearching={isSearching}
            isMissingHeadReport={isMissingHeadReport}
          />
        )}
      </div>
    </div>
  )
}

export default CodeTreeTable
