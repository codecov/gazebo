import cs from 'classnames'
import PropTypes from 'prop-types'
import isNumber from 'lodash/isNumber'

import Table from 'ui/Table'
import A from 'ui/A'
import Progress from 'ui/Progress'
import Spinner from 'ui/Spinner'

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
    width: 'w-7/12 min-w-min',
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

function CommitsTable({ data = [], commit, loading }) {
  function getDataRow() {
    return data?.map((d) => {
      let change = d?.headCoverage?.coverage - d?.baseCoverage?.coverage
      if (isNaN(change)) {
        change = null
      }
      return {
        name: (
          <div className="flex flex-col">
            <A
              to={{
                pageName: 'commitFile',
                options: { commit, path: d.headName },
              }}
            >
              <span>{d.headName?.split('/').pop()}</span>
            </A>
            <span className="text-xs mt-0.5 text-ds-gray-quinary">
              {d.headName}
            </span>
          </div>
        ),
        coverage: (
          <div className="w-full flex gap-2 items-center">
            <Progress amount={d?.headCoverage?.coverage || 0} label={true} />
          </div>
        ),
        patch: (
          <span className="text-sm text-right w-full text-ds-gray-octonary">
            {isNumber(d?.patchCoverage?.coverage)
              ? `${d?.patchCoverage?.coverage?.toFixed(2)}%`
              : '-'}
          </span>
        ),
        change: (
          <span
            className={cs(
              'text-sm text-right w-full font-semibold text-ds-gray-octonary',
              {
                'bg-transparent': !change,
                'bg-ds-coverage-uncovered': change < 0,
                'bg-ds-coverage-covered': change >= 0,
              }
            )}
          >
            {isNumber(change) ? `${change.toFixed(2)}%` : '-'}
          </span>
        ),
      }
    })
  }

  const tableData =
    data?.length > 0
      ? getDataRow()
      : [
          {
            name: 'No Files covered by tests were changed',
          },
        ]
  return loading === 'pending' ? (
    <div className="w-full flex h-44 justify-center">
      <Spinner size={60} />
    </div>
  ) : (
    <Table data={tableData} columns={table} />
  )
}

CommitsTable.propTypes = {
  loading: PropTypes.string,
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
