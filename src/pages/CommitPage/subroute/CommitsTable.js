import isNumber from 'lodash/isNumber'
import PropTypes from 'prop-types'

import A from 'ui/A'
import Progress from 'ui/Progress'
import Spinner from 'ui/Spinner'
import Table from 'ui/Table'
import TotalsNumber from 'ui/TotalsNumber'

const table = [
  {
    Header: 'Name',
    accessor: 'name',
    width: 'w-7/12 min-w-min',
  },
  {
    Header: (
      <span className="w-full text-right">
        <span className="font-mono">HEAD</span> file coverage %
      </span>
    ),
    accessor: 'coverage',
    width: 'w-3/12 min-w-min',
  },
  {
    Header: <span className="w-full text-sm text-right">Patch</span>,
    accessor: 'patch',
    width: 'w-28 min-w-min',
  },
  {
    Header: <span className="w-full text-right">Change</span>,
    accessor: 'change',
    width: 'w-28 min-w-min',
  },
]

function useFormatTableData({ tableData = [], commit }) {
  return tableData.map((row) => {
    const change = row?.headCoverage?.coverage - row?.baseCoverage?.coverage
    return {
      name: (
        <div className="flex flex-col">
          <A
            to={{
              pageName: 'commitFile',
              options: { commit, path: row.headName },
            }}
          >
            <span>{row.headName?.split('/').pop()}</span>
          </A>
          <span className="text-xs mt-0.5 text-ds-gray-quinary">
            {row.headName}
          </span>
        </div>
      ),
      coverage: (
        <div className="flex flex-1 gap-2 items-center">
          <Progress
            amount={row?.headCoverage?.coverage || 0}
            label
            isCoverage
          />
        </div>
      ),
      patch: (
        <TotalsNumber
          value={
            isNumber(row?.patchCoverage?.coverage)
              ? row?.patchCoverage?.coverage
              : Number.NaN
          }
        />
      ),
      change: (
        <TotalsNumber value={change} showChange data-testid="change-value" />
      ),
    }
  })
}

function CommitsTable({ data = [], commit, state }) {
  const formattedData = useFormatTableData({ tableData: data, commit })

  if (state === 'pending') {
    return (
      <div className="flex-1 flex justify-center">
        <Spinner size={60} />
      </div>
    )
  }

  return (
    <>
      <Table data={formattedData} columns={table} />
      {data?.length === 0 && (
        <p className="mx-4">No Files covered by tests were changed</p>
      )}
    </>
  )
}

CommitsTable.propTypes = {
  state: PropTypes.string,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      headName: PropTypes.string,
      headCoverage: PropTypes.shape({
        coverage: PropTypes.number,
      }),
      baseCoverage: PropTypes.shape({
        coverage: PropTypes.number,
      }),
      patchCoverage: PropTypes.shape({
        coverage: PropTypes.number,
      }),
    })
  ),
  commit: PropTypes.string,
}

export default CommitsTable
