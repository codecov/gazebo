import cs from 'classnames'
import PropTypes from 'prop-types'
import Table from 'ui/Table'
import A from 'ui/A'
import Progress from 'ui/Progress'

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

function CommitsTable({ data = [], commit }) {
  const dataTable =
    data?.length > 0
      ? data?.map((d) => {
          let change = d?.compareTotals?.coverage - d?.baseTotals?.coverage
          if (isNaN(change)) {
            change = null
          }
          return {
            name: (
              <div className="flex flex-col">
                <A
                  to={{
                    pageName: 'commitFile',
                    options: { commit, path: d.path },
                  }}
                >
                  <span>{d.path?.split('/').pop()}</span>
                </A>
                <span className="text-xs mt-0.5 text-ds-gray-quinary">
                  {d.path}
                </span>
              </div>
            ),
            coverage: (
              <Progress amount={d?.compareTotals?.coverage || 0} label={true} />
            ),
            patch: (
              <span className="text-sm text-right w-full text-ds-gray-octonary">
                {d?.patch?.coverage
                  ? `${d?.patch?.coverage?.toFixed(2)}%`
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
                {change ? `${change.toFixed(2)}%` : '-'}
              </span>
            ),
          }
        })
      : [
          {
            name: 'No Files covered by tests were changed',
          },
        ]

  return <Table data={dataTable} columns={table} />
}

CommitsTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string,
      compareTotals: PropTypes.shape({
        coverage: PropTypes.number,
      }),
      baseTotals: PropTypes.shape({
        coverage: PropTypes.number,
      }),
      patch: PropTypes.shape({
        coverage: PropTypes.number,
      }),
    })
  ),
  commit: PropTypes.string,
}

export default CommitsTable
