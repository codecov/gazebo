import Spinner from 'ui/Spinner'
import Table from 'ui/Table'
import TotalsNumber from 'ui/TotalsNumber'

import { useIndirectChangedFilesTable } from './hooks'
import NameColumn from './NameColumn'

import FileDiff from '../FileDiff'

const columns = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    width: 'w-7/12',
    cell: ({ row, getValue }) => <NameColumn row={row} getValue={getValue} />,
    justifyStart: true,
  },
  {
    id: 'head',
    header: (
      <span className="flex-1 text-right">
        <span className="font-mono">HEAD</span> file coverage %
      </span>
    ),
    accessorKey: 'head',
    width: 'w-4/12 justify-end',
    cell: (info) => info.getValue(),
  },
  {
    id: 'change',
    header: <span className="flex-1 text-right">Change</span>,
    accessorKey: 'change',
    width: 'w-2/12 justify-end',
    cell: (info) => info.getValue(),
  },
]

function createTable({ tableData }) {
  return tableData?.length > 0
    ? tableData?.map((row) => {
        const {
          headCoverage,
          patchCoverage,
          changeCoverage,
          hasHeadOrPatchCoverage,
          headName,
          isCriticalFile,
        } = row

        return {
          name: (
            <div className="flex gap-4">
              <span className="text-ds-blue break-all">{headName}</span>
              {isCriticalFile && (
                <span className="p-1 border border-ds-gray-tertiary rounded text-xs text-ds-gray-senary self-center">
                  Critical File
                </span>
              )}
            </div>
          ),
          head: <TotalsNumber value={headCoverage} plain />,
          patch: <TotalsNumber value={patchCoverage} />,
          change: hasHeadOrPatchCoverage ? (
            <TotalsNumber
              value={changeCoverage}
              showChange
              data-testid="change-value"
            />
          ) : (
            <span className="text-ds-gray-quinary text-sm ml-4">
              No data available
            </span>
          ),
        }
      })
    : []
}

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

const renderSubComponent = ({ row }) => {
  const nameColumn = row.getValue('name')
  const [fileNames] = nameColumn?.props?.children
  const path = fileNames?.props?.children

  // TODO: this component has a nested table and needs to be reworked,
  // as it is used inside the Table component, which leads to an accessibility issue
  return <FileDiff path={path} />
}

function IndirectChangedFiles() {
  const { data, handleSort, isLoading } = useIndirectChangedFilesTable()

  const tableContent = createTable({
    tableData: data?.impactedFiles,
  })

  if (isLoading) {
    return <Loader />
  }

  return (
    <Table
      data={tableContent}
      columns={columns}
      onSort={handleSort}
      renderSubComponent={renderSubComponent}
    />
  )
}

export default IndirectChangedFiles
