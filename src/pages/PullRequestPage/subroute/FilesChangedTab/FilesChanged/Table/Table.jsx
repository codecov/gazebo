import Table from 'old_ui/Table'
import A from 'ui/A'
import Spinner from 'ui/Spinner'
import TotalsNumber from 'ui/TotalsNumber'

import FileDiff from '../../shared/FileDiff'
import { useImpactedFilesTable } from '../hooks'
import NameColumn from '../NameColumn'

const columns = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    width: 'w-8/12 min-w-min',
    cell: ({ row, getValue }) => <NameColumn row={row} getValue={getValue} />,
    justifyStart: true,
  },
  {
    id: 'missesCount',
    header: 'Missed lines',
    accessorKey: 'missesCount',
    width: 'w-56 min-w-min',
    cell: (info) => info.getValue(),
  },
  {
    id: 'head',
    header: <span className="w-full text-right font-mono">HEAD %</span>,
    accessorKey: 'head',
    width: 'w-36 min-w-min',
    cell: (info) => info.getValue(),
  },
  {
    id: 'patch',
    header: <span className="w-full text-right text-sm">Patch %</span>,
    accessorKey: 'patch',
    width: 'w-36 min-w-min',
    cell: (info) => info.getValue(),
  },
  {
    id: 'change',
    header: <span className="w-full text-right">Change</span>,
    accessorKey: 'change',
    width: 'w-36 min-w-min',
    cell: (info) => info.getValue(),
  },
]

function createTable({ tableData, pullId }) {
  return tableData?.length > 0
    ? tableData?.map((row) => {
        const {
          headCoverage,
          patchCoverage,
          missesCount,
          changeCoverage,
          hasHeadOrPatchCoverage,
          headName,
          isCriticalFile,
        } = row

        return {
          name: (
            <div className="flex gap-4">
              <A
                to={{
                  pageName: 'pullFileView',
                  options: { pullId, tree: headName },
                }}
              >
                {headName}
              </A>
              {isCriticalFile && (
                <span className="self-center rounded border border-ds-gray-tertiary p-1 text-xs text-ds-gray-senary">
                  Critical File
                </span>
              )}
            </div>
          ),
          missesCount: (
            <div className="flex w-full justify-end">{missesCount}</div>
          ),
          head: (
            <div className="flex w-full justify-end">
              <TotalsNumber value={headCoverage} plain />
            </div>
          ),
          patch: (
            <div className="flex w-full justify-end">
              <TotalsNumber value={patchCoverage} />
            </div>
          ),
          change: hasHeadOrPatchCoverage ? (
            <TotalsNumber
              value={changeCoverage}
              showChange
              data-testid="change-value"
            />
          ) : (
            <span className="ml-4 text-sm text-ds-gray-quinary">No data</span>
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
    pullId: data?.pullId,
  })

  return (
    <>
      <Table
        data={tableContent}
        columns={columns}
        onSort={handleSort}
        defaultSort={[{ id: 'missesCount', desc: true }]}
        renderSubComponent={renderSubComponent}
      />
      {isLoading && <Loader />}
    </>
  )
}

export default ImpactedFiles
