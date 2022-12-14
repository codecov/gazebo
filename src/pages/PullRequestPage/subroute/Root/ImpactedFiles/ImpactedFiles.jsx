import Progress from 'ui/Progress'
import Spinner from 'ui/Spinner'
import Table from 'ui/Table'
import TotalsNumber from 'ui/TotalsNumber'

import { useImpactedFilesTable } from './hooks'
import NameColumn from './NameColumn'

import FileDiff from '../FileDiff'

const columns = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    width: 'w-7/12 min-w-min',
    cell: ({ row, getValue }) => <NameColumn row={row} getValue={getValue} />,
    justifyStart: true,
  },
  {
    id: 'head',
    header: (
      <span className="w-full text-right">
        <span className="font-mono">HEAD</span> file coverage %
      </span>
    ),
    accessorKey: 'head',
    width: 'w-3/12 min-w-min',
    cell: (info) => info.getValue(),
  },
  {
    id: 'patch',
    header: <span className="w-full text-sm text-right">Patch %</span>,
    accessorKey: 'patch',
    width: 'w-28 min-w-min',
    cell: (info) => info.getValue(),
  },
  {
    id: 'change',
    header: <span className="w-full text-right">Change</span>,
    accessorKey: 'change',
    width: 'w-28 min-w-min',
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
          head: (
            <div className="flex flex-1 gap-2 items-center">
              <Progress amount={headCoverage} label />
            </div>
          ),
          patch: (
            <div className="w-full flex justify-end">
              <TotalsNumber value={patchCoverage} />
            </div>
          ),
          change: hasHeadOrPatchCoverage ? (
            <div className="w-full flex justify-end">
              <TotalsNumber
                value={changeCoverage}
                showChange
                data-testid="change-value"
              />
            </div>
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

function ImpactedFiles() {
  const { data, handleSort, isLoading } = useImpactedFilesTable()

  const tableContent = createTable({
    tableData: data?.impactedFiles,
  })

  return (
    <>
      <Table
        data={tableContent}
        columns={columns}
        onSort={handleSort}
        renderSubComponent={renderSubComponent}
      />
      {isLoading && <Loader />}
    </>
  )
}

export default ImpactedFiles
