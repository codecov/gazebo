import isNumber from 'lodash/isNumber'
import PropTypes from 'prop-types'

import A from 'ui/A'
import Change from 'ui/Change'
import Progress from 'ui/Progress'
import Spinner from 'ui/Spinner'
import Table from 'ui/Table'

const getFileData = ({ headCoverage, patchCoverage, baseCoverage }) => {
  const headCov = headCoverage?.coverage
  const patchCov = patchCoverage?.coverage
  const baseCov = baseCoverage?.coverage
  const change = isNumber(headCov) && isNumber(baseCov) ? headCov - baseCov : 0

  const hasData = isNumber(headCov) || isNumber(patchCov)
  const noDataDisplay = hasData && '-'

  return {
    headCoverage: headCov,
    patchCoverage: patchCov,
    hasData,
    change,
    noDataDisplay,
  }
}

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

function useFormatTableData({ tableData, commit }) {
  return tableData.map((row) => {
    const { headCoverage, patchCoverage, hasData, change, noDataDisplay } =
      getFileData({
        headCoverage: row?.headCoverage,
        patchCoverage: row?.patchCoverage,
        baseCoverage: row?.baseCoverage,
      })

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
      coverage: isNumber(headCoverage) ? (
        <div className="flex flex-1 gap-2 items-center">
          <Progress amount={headCoverage} label={true} />
        </div>
      ) : (
        <div className="flex flex-1 justify-end">{noDataDisplay}</div>
      ),
      patch: (
        <span className="text-sm text-right w-full text-ds-gray-octonary">
          {isNumber(patchCoverage)
            ? `${patchCoverage?.toFixed(2)}%`
            : noDataDisplay}
        </span>
      ),
      change: hasData ? (
        <Change value={change} variant="default" />
      ) : (
        <span className="text-ds-gray-quinary text-sm whitespace-nowrap -m-14 lg:-m-12">
          No data available
        </span>
      ),
    }
  })
}

function CommitsTable({ data = [], commit, state }) {
  const formatedData = useFormatTableData({ tableData: data, commit })

  if (state === 'pending') {
    return (
      <div className="flex-1 flex justify-center">
        <Spinner size={60} />
      </div>
    )
  }

  return (
    <>
      <Table data={formatedData} columns={table} />
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
