import cs from 'classnames'
import isEmpty from 'lodash/isEmpty'
import isNumber from 'lodash/isNumber'
import PropTypes from 'prop-types'
import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import Table from 'old_ui/Table'
import { useCommit } from 'services/commit'
import A from 'ui/A'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'
import TotalsNumber from 'ui/TotalsNumber'

const CommitFileDiff = lazy(() => import('./CommitFileDiff'))

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
    width: 'w-7/12',
    cell: ({ row, getValue }) => (
      <div
        className="flex cursor-pointer items-center gap-2"
        data-testid="name-expand"
        onClick={() => row.toggleExpanded()}
      >
        <span
          className={cs({
            'text-ds-blue-darker': row.getIsExpanded(),
            'text-current': !row.getIsExpanded(),
          })}
        >
          <Icon
            size="md"
            name={row.getIsExpanded() ? 'chevron-down' : 'chevron-right'}
            variant="solid"
          />
        </span>
        {getValue()}
      </div>
    ),
    justifyStart: true,
  },
  {
    id: 'coverage',
    header: 'HEAD',
    accessorKey: 'coverage',
    width: 'w-3/12 justify-end',
    cell: (info) => info.getValue(),
  },
  {
    id: 'change',
    header: 'Change',
    accessorKey: 'change',
    width: 'w-2/12 justify-end',
    cell: (info) => info.getValue(),
  },
]

function createTable({ tableData }) {
  return tableData?.map((row) => {
    const { headName, headCoverage, hasData, change, commit } = row

    return {
      name: (
        <div className="flex flex-col break-all">
          <A
            to={{
              pageName: 'commitFileDiff',
              options: { commit: commit?.commitid, tree: headName },
            }}
          >
            {headName}
          </A>
        </div>
      ),
      coverage: <TotalsNumber value={headCoverage} plain />,
      /*
          The container div fot TotalsNumber is added due to the current state of table cells styling,
          shouldn't be necessary in the future if fixed/updated
      */
      change: hasData ? (
        <TotalsNumber value={change} showChange data-testid="change-value" />
      ) : (
        <span className="ml-4 text-sm text-ds-gray-quinary md:whitespace-nowrap">
          No data
        </span>
      ),
    }
  })
}

const Loader = () => (
  <div className="mb-4 flex justify-center">
    <Spinner size={60} />
  </div>
)

const RenderSubComponent = ({ row }) => {
  const nameColumn = row.getValue('name')
  const file = nameColumn?.props?.children
  const path = file?.props?.children

  return (
    <Suspense fallback={<Loader />}>
      <CommitFileDiff path={path} />
    </Suspense>
  )
}

RenderSubComponent.propTypes = {
  row: PropTypes.object.isRequired,
}

function IndirectChangesTable() {
  const { provider, owner, repo, commit: commitSHA } = useParams()

  const { data: commitData, isLoading } = useCommit({
    provider,
    owner,
    repo,
    commitid: commitSHA,
    filters: {
      hasUnintendedChanges: true,
    },
  })

  const commit = commitData?.commit

  if (isLoading || commit?.state === 'pending') {
    return <Loader />
  }

  let indirectChangedFiles = []
  if (
    commit?.compareWithParent?.__typename === 'Comparison' &&
    commit?.compareWithParent?.impactedFiles?.__typename === 'ImpactedFiles'
  ) {
    indirectChangedFiles = commit?.compareWithParent?.impactedFiles?.results
  }

  if (isEmpty(indirectChangedFiles)) {
    return <p className="m-4">No files covered by tests were changed</p>
  }

  const formattedData = indirectChangedFiles?.map((row) =>
    getFileData(row, commit)
  )
  const tableContent = createTable({ tableData: formattedData })

  return (
    <Table
      data={tableContent}
      columns={table}
      renderSubComponent={RenderSubComponent}
    />
  )
}

export default IndirectChangesTable
