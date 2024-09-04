import type { Meta, StoryObj } from '@storybook/react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ExpandedState, SortingState } from '@tanstack/react-table'
import cs from 'classnames'
import { createBrowserHistory } from 'history'
import { Fragment, useState } from 'react'
import { Route, Router, Switch } from 'react-router-dom'

import { CODE_RENDERER_TYPE } from 'shared/utils/fileviewer'

import A from '../A'
import CodeRenderer from '../CodeRenderer'
import CodeRendererInfoRow from '../CodeRenderer/CodeRendererInfoRow'
import DiffLine from '../CodeRenderer/DiffLine'
import Icon from '../Icon'
import TotalsNumber from '../TotalsNumber'

import './FileList.css'

const history = createBrowserHistory()
const coverage = ['H', 'M', 'P'] as const

interface Segment {
  path: string
  missed: number
  head: number
  patch: number
  change: number
  contents: string
}

const files: Segment[] = [
  {
    path: 'src/ui/Table/Table.stories.tsx',
    missed: 680,
    head: 89,
    patch: 45,
    change: 34,
    contents: `const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
      const CommitDetailPage = lazy(() => import('./pages/CommitDetailPage'))`,
  },
  {
    path: 'src/ui/Table/TableSorting.stories.tsx',
    missed: 176,
    head: 65,
    patch: 67,
    change: -8,
    contents: `
function SortingExampleWithReactTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const columns = [
    columnHelper.accessor('name', {
      header: () => 'Name',
      cell: (info) => info.renderValue(),
    }),
    columnHelper.accessor('title', {
      header: () => 'Title',
      cell: (info) => info.renderValue(),
    }),
`,
  },
]

const columnHelper = createColumnHelper<Segment>()

const isNumericColumn = (cellId: string) =>
  cellId === 'missed' ||
  cellId === 'head' ||
  cellId === 'patch' ||
  cellId === 'change'

function Example() {
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = [
    columnHelper.accessor('path', {
      header: () => 'Name',
      cell: ({ row, getValue }) => (
        <span
          className="inline-flex cursor-pointer items-center gap-1 font-sans text-ds-blue-default hover:underline focus:ring-2"
          {...{
            onClick: row.getToggleExpandedHandler(),
          }}
        >
          {row.getCanExpand() ? (
            <Icon
              size="md"
              name={row.getIsExpanded() ? 'chevronDown' : 'chevronRight'}
              variant="solid"
            />
          ) : (
            '🔵'
          )}
          {getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('missed', {
      header: () => 'Missed lines',
      cell: (info) => info.renderValue(),
    }),
    columnHelper.accessor('head', {
      header: () => 'HEAD %',
      cell: (info) => <TotalsNumber value={info.renderValue()} plain />,
    }),
    columnHelper.accessor('patch', {
      header: () => 'Patch %',
      cell: (info) => <TotalsNumber value={info.renderValue()} plain />,
    }),
    columnHelper.accessor('change', {
      header: () => 'Change',
      cell: (info) => <TotalsNumber value={info.renderValue()} />,
    }),
  ]

  const table = useReactTable({
    data: files,
    columns,
    state: {
      expanded,
      sorting,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => row.original.contents.length > 0,
  })

  return (
    <div className="filelistui" data-highlight-row="onHover">
      <div>
        {table.getHeaderGroups().map((headerGroup) => (
          <div
            key={headerGroup.id}
            className="filelistui-thead"
            data-highlight-row="onHover"
          >
            {headerGroup.headers.map((header) => (
              <div
                key={header.id}
                data-sortable="true"
                {...{
                  onClick: header.column.getToggleSortingHandler(),
                }}
                // define column widths, must be done in the body as well.
                className={cs({
                  'w-full @4xl/w-4/12': header.id === 'path',
                  'w-2/12 hidden @4xl/filelist:block':
                    header.id === 'change' ||
                    header.id === 'patch' ||
                    header.id === 'head' ||
                    header.id === 'missed',
                })}
              >
                <div
                  className={cs('flex gap-1', {
                    // reverse the order of the icon and text so the text is aligned well when not active.
                    'flex-row-reverse justify-end': header.id === 'path',
                  })}
                  {...(isNumericColumn(header.id)
                    ? {
                        'data-type': 'numeric',
                      }
                    : {})}
                >
                  <span
                    className="text-ds-blue-darker"
                    data-sort-direction={header.column.getIsSorted()}
                  >
                    <Icon name="arrowUp" size="sm" />
                  </span>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
        <div>
          {table.getRowModel().rows.map((row, i) => (
            <Fragment key={i}>
              <div className="filelistui-row">
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    {...(isNumericColumn(cell.column.id)
                      ? {
                          'data-type': 'numeric',
                        }
                      : {})}
                    className={cs({
                      'w-full @4xl/w-4/12': cell.column.id === 'path',
                      'w-2/12 hidden @4xl/filelist:block':
                        cell.column.id === 'change' ||
                        cell.column.id === 'patch' ||
                        cell.column.id === 'head' ||
                        cell.column.id === 'missed',
                    })}
                  >
                    {/* start: Responsive example */}
                    <div className="mb-6 flex justify-between gap-8 @md/filelist:justify-start @4xl/filelist:hidden">
                      <div>
                        Missed lines:{' '}
                        <div className="font-mono">{row.original.missed}</div>
                      </div>
                      <div>
                        head: <TotalsNumber value={row.original.head} plain />
                      </div>
                      <div>
                        {' '}
                        patch: <TotalsNumber value={row.original.patch} plain />
                      </div>
                      <div>
                        {' '}
                        Change: <TotalsNumber value={row.original.change} />
                      </div>
                    </div>
                    {/* end: Responsive example */}

                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
              <div data-expanded={row.getIsExpanded()}>
                {/*  Start: Not part of filelistui, just for example */}
                <CodeRendererInfoRow>
                  <div className="flex w-full justify-between">
                    <div className="flex gap-1">
                      <span data-testid="patch">{row.original.patch}</span>
                      <span className="border-l-2 pl-2">
                        {row.original.path}
                      </span>
                    </div>
                    {/* @ts-expect-error */}
                    <A href="#" isExternal hook="commit full file">
                      View full file
                    </A>
                  </div>
                </CodeRendererInfoRow>
                <CodeRenderer
                  code={row.original.contents}
                  fileName={row.original.path}
                  rendererType={CODE_RENDERER_TYPE.DIFF}
                  LineComponent={({ i, line, ...props }) => (
                    <DiffLine
                      {...props}
                      key={i + 1}
                      lineContent={line}
                      path={row.original.path}
                      hitCount={
                        Math.random() > 0.5
                          ? Math.floor(Math.random() * 100)
                          : null
                      }
                      headNumber={`${i + 1}`}
                      baseNumber={`${i}`}
                      headCoverage={
                        coverage[Math.floor(Math.random() * 3) % 3] ?? null
                      }
                      baseCoverage={
                        coverage[Math.floor(Math.random() * 3) % 3] ?? null
                      }
                      getTokenProps={({ token, key }) => ({})}
                    />
                  )}
                />
                {/*  End: Not part of filelistui, just for example */}
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

const meta: Meta<typeof Example> = {
  title: 'Components/FileList',
  component: Example,
}

export default meta
type Story = StoryObj<typeof Example>

export const BasicExample: Story = {
  render: () => (
    <Router history={history}>
      <Switch>
        <Route path="*">
          <Example />
        </Route>
      </Switch>
    </Router>
  ),
}
