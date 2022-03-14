import isNumber from 'lodash/isNumber'
import PropTypes from 'prop-types'

import A from 'ui/A'
import Change from 'ui/Change'
import Progress from 'ui/Progress'
import Spinner from 'ui/Spinner'
import Table from 'ui/Table'

const getFileData = ({ headCoverage, patchCoverage }) => {
  const headCove = headCoverage?.coverage
  const patchCov = patchCoverage?.coverage
  const change = headCove - patchCov

  const hasData = isNumber(headCove) && isNumber(patchCov)
  const noDataDisplay = hasData && '-'

  return {
    headCoverage: headCove,
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

function useFormatTableData({ commit }) {
  const tableData = [
    {
      headName: 'src/index2.py',
      baseCoverage: {
        coverage: 62.5,
      },
      headCoverage: {
        coverage: 50.0,
      },
      patchCoverage: {
        coverage: 37.5,
      },
    },
    {
      headName: 'src/index2.py',
      baseCoverage: {
        coverage: null,
      },
      headCoverage: {
        coverage: null,
      },
      patchCoverage: {
        coverage: null,
      },
    },
  ]
  return tableData.map((row) => {
    const { headCoverage, patchCoverage, hasData, change, noDataDisplay } =
      getFileData({
        headCoverage: row?.headCoverage,
        patchCoverage: row?.patchCoverage,
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
        noDataDisplay
      ),
      patch: isNumber(patchCoverage) ? (
        <span className="text-sm text-right w-full text-ds-gray-octonary">
          ${patchCoverage?.toFixed(2)}%
        </span>
      ) : (
        noDataDisplay
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
