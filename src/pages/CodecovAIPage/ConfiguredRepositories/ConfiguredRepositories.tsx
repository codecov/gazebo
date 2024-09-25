import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useCodecovAIInstalledRepos } from 'services/codecovAI/useCodecovAIInstalledRepos'
import A from 'ui/A'
import { Card } from 'ui/Card'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'

import InstallCodecovAI from '../InstallCodecovAI/InstallCodecovAI'

interface URLParams {
  owner: string
  provider: string
}

const Loader = () => (
  <div className="mb-4 flex justify-center pt-4">
    <Spinner />
  </div>
)

const columnHelper = createColumnHelper<{ name: string }>()

function ConfiguredRepositories() {
  const { owner, provider } = useParams<URLParams>()

  const { data: installedRepos, isLoading } = useCodecovAIInstalledRepos({
    owner,
    provider,
  })

  const [tempInstalledRepos, setTempInstalledRepos] = useState([
    'gazebo',
    'review-prompt-os',
  ])

  const [isSortedAscending, setIsSortedAscending] = useState(true)

  const sortRepos = () => {
    const nextIsSortedAscending = !isSortedAscending
    const sortedRepos = [...tempInstalledRepos].sort((a, b) =>
      nextIsSortedAscending ? a.localeCompare(b) : b.localeCompare(a)
    )
    setTempInstalledRepos(sortedRepos)
    setIsSortedAscending(nextIsSortedAscending)
  }

  const tableData = useMemo(
    () => tempInstalledRepos.map((name) => ({ name })),
    [tempInstalledRepos]
  )

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Repo Name',
        cell: (info) => {
          const repoName = info.getValue()
          const link = `/${provider}/${owner}/${repoName}`
          return (
            <A
              href={link}
              to={undefined}
              hook={undefined}
              isExternal={undefined}
            >
              {repoName}
            </A>
          )
        },
      }),
    ],
    [provider, owner]
  )

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  //This should technically never happen, but render a fallback just in case
  if (!installedRepos || installedRepos.length === 0) {
    return <InstallCodecovAI />
  }

  return (
    <div className="flex flex-col">
      <Card className="mb-0 border-b-0">
        <Card.Header className="border-b-0">
          <Card.Title size="base">
            {tempInstalledRepos?.length} configured repositories
          </Card.Title>
          <p>
            To install more repos, please manage your Codecov AI app on Github.
            <br />
            To uninstall the app, please go to your GitHub Apps settings.
          </p>
        </Card.Header>
      </Card>
      <div className="tableui border border-t-0">
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    onClick={sortRepos}
                    className="cursor-pointer"
                  >
                    <div className="flex gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      <span
                        className="text-ds-blue-darker group-hover/columnheader:opacity-100"
                        data-sort-direction={isSortedAscending ? 'asc' : 'desc'}
                      >
                        <Icon name="arrowUp" size="sm" />
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={1}>
                  <Loader />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ConfiguredRepositories
