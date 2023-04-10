import PropType from 'prop-types'

import Table from 'ui/Table'

import Loader from './Loader'
import RepoContentsResult from './RepoContentsResult'

function CodeTreeTable({
  data,
  headers,
  handleSort,
  isSearching,
  isMissingHeadReport,
  isLoading,
}) {
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

CodeTreeTable.propTypes = {
  data: PropType.array,
  headers: PropType.array,
  handleSort: PropType.func,
  isSearching: PropType.bool,
  isMissingHeadReport: PropType.bool,
  isLoading: PropType.bool,
}

export default CodeTreeTable
