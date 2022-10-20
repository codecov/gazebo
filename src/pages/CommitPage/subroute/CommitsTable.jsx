import isNumber from 'lodash/isNumber'
import PropTypes from 'prop-types'
import { useMemo } from 'react'

import { getFilenameFromFilePath } from 'shared/utils/url'
import A from 'ui/A'
import Progress from 'ui/Progress'
import Spinner from 'ui/Spinner'
import Table from 'ui/Table'
import TotalsNumber from 'ui/TotalsNumber'

const getFileData = (row, commit) => {
  const headCov = row?.headCoverage?.coverage
  const patchCov = row?.patchCoverage?.coverage
  const baseCov = row?.baseCoverage?.coverage

  const change =
    isNumber(headCov) && isNumber(baseCov) ? headCov - baseCov : Number.NaN

  const hasData = isNumber(headCov) || isNumber(patchCov)

  return {
    headCoverage: headCov,
    patchCoverage: patchCov,
    hasData,
    change,
    headName: row?.headName,
    commit,
  }
}

const table = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    width: 'w-7/12 min-w-min',
    cell: (info) => info.getValue(),
    justifyStart: true,
  },
  {
    id: 'coverage',
    header: (
      <>
        <span className="font-mono mr-2">HEAD</span> file coverage %
      </>
    ),
    accessorKey: 'coverage',
    width: 'w-3/12 min-w-min',
    cell: (info) => info.getValue(),
  },
  {
    id: 'patch',
    header: 'Patch %',
    accessorKey: 'patch',
    width: 'w-28 min-w-min',
    cell: (info) => info.getValue(),
  },
  {
    id: 'change',
    header: 'Change',
    accessorKey: 'change',
    width: 'w-28 min-w-min',
    cell: (info) => info.getValue(),
  },
]

function createTable({ tableData }) {
  if (tableData.length <= 0) {
    return [{ name: null, coverage: null, patch: null, change: null }]
  }

  return tableData.map((row) => {
    const { headName, headCoverage, hasData, change, commit, patchCoverage } =
      row

    return {
      name: (
        <div className="flex flex-col">
          <A
            to={{
              pageName: 'commitFile',
              options: { commit, path: headName },
            }}
          >
            <span>{getFilenameFromFilePath(headName)}</span>
          </A>
          <span className="text-xs mt-0.5 text-ds-gray-quinary">
            {headName}
          </span>
        </div>
      ),
      coverage: (
        <div className="flex flex-1 gap-2 items-center">
          <Progress amount={headCoverage} label />
        </div>
      ),
      /*
          The container div fot TotalsNumber is added due to the current state of table cells styling,
          shouldn't be necessary in the future if fixed/updated
      */
      patch: (
        <div className="w-full flex justify-end">
          <TotalsNumber value={patchCoverage} />
        </div>
      ),
      change: hasData ? (
        <div className="w-full flex justify-end">
          <TotalsNumber value={change} showChange data-testid="change-value" />
        </div>
      ) : (
        <span className="text-ds-gray-quinary text-sm ml-4">
          No data available
        </span>
      ),
    }
  })
}

function CommitsTable({ data = [], commit, state }) {
  const formattedData = useMemo(
    () => data.map((row) => getFileData(row, commit)),
    [data, commit]
  )
  const tableContent = createTable({ tableData: formattedData })

  if (state === 'pending') {
    return (
      <div className="flex-1 flex justify-center">
        <Spinner size={60} />
      </div>
    )
  }

  return (
    <>
      {data?.length === 0 ? (
        <p className="mx-4">No Files covered by tests were changed</p>
      ) : (
        <Table data={tableContent} columns={table} />
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
