import Table from 'ui/Table'
import Progress from 'ui/Progress'
import cs from 'classnames'

const table = [
  {
    Header: 'Name',
    accessor: 'name',
    width: 'w-6/12',
  },
  {
    Header: 'HEAD file coverage %',
    accessor: 'coverage',
    width: 'w-4/12 text-right',
  },
  {
    Header: 'Patch',
    accessor: 'patch',
    width: 'w-2/12',
  },
  {
    Header: 'Change',
    accessor: 'change',
    width: 'w-2/12',
  },
]

function CommitsTable() {
  const data = [
    {
      name: 'detec.js',
      path: 'root/specs',
      coverage: 73.55,
      patch: 99.98,
      change: -0.6,
    },
    {
      name: 'post.js',
      path: 'src/',
      coverage: 43.55,
      patch: 55.98,
      change: 2.6,
    },
  ]

  // We need to conditionally change background color for patch... we do not have those color on tailwind
  const dataTable = data.map((d) => ({
    name: (
      <div className="flex flex-col">
        <span className="text-ds-blue-darker text-sm">{d.name}</span>
        <span className="text-xs mt-0.5 text-ds-gray-quinary">{d.path}</span>
      </div>
    ),
    coverage: <Progress amount={d.coverage} label={true} />,
    patch: <span className="text-sm text-ds-gray-octonary">{d.patch}%</span>,
    change: (
      <span className={cs('text-sm font-semibold text-ds-gray-octonary')}>
        {d.change}
      </span>
    ),
  }))

  return <Table data={dataTable} columns={table} />
}

export default CommitsTable
