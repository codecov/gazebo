import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useParams } from 'react-router'

import A from 'ui/A'
import { Card } from 'ui/Card'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'
import { Tooltip } from 'ui/Tooltip'

import { Account } from '../hooks/useEnterpriseAccountDetails'
import { useInfiniteAccountOrganizations } from '../hooks/useInfiniteAccountOrganizations'

interface AccountOrgsArgs {
  account: Account
}

interface AccountOrgRow {
  name: string
  activatedUserCount: number
  isCurrentUserPartOfOrg: boolean
}

const Loader = () => (
  <div className="mb-4 flex justify-center pt-4" data-testid="spinner">
    <Spinner />
  </div>
)

const ActivatedUsersTooltip = () => (
  <Tooltip delayDuration={0} skipDelayDuration={100}>
    <Tooltip.Root>
      <Tooltip.Trigger>
        <Icon
          name="informationCircle"
          className="[&_path]:stroke-[3px]"
          size="sm"
        />
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content side="top">
          <p>
            This includes users <br />
            who are activated in <br />
            multiple organizations.
          </p>
          <Tooltip.Arrow />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip>
)

const columnHelper = createColumnHelper<AccountOrgRow>()

const columns = [
  columnHelper.accessor('name', {
    id: 'name',
    header: 'Organization name',
    cell: (info) =>
      info.row.original.isCurrentUserPartOfOrg ? (
        info.renderValue()
      ) : (
        <div className="flex items-center gap-2">
          {info.renderValue()}
          <span className="text-xs font-light text-ds-gray-quaternary">
            Not a member
          </span>
        </div>
      ),
  }),
  columnHelper.accessor('activatedUserCount', {
    id: 'activatedUserCount',
    enableSorting: false,
    header: () => (
      <div className="flex items-center gap-1">
        <p>Activated members</p>
        <ActivatedUsersTooltip />
      </div>
    ),
    cell: ({ renderValue }) => <p className="text-right">{renderValue()}</p>,
  }),
]

interface URLParams {
  provider: string
  owner: string
}

export default function AccountOrgs({ account }: AccountOrgsArgs) {
  const { provider, owner } = useParams<URLParams>()
  const { ref, inView } = useInView()
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'name',
      desc: false,
    },
  ])

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteAccountOrganizations({
      provider,
      owner,
      first: 20,
      orderingDirection: sorting[0]?.desc ? 'DESC' : 'ASC',
    })

  const accountOrgs: AccountOrgRow[] = useMemo(() => {
    if (!data) return []

    return data.pages.flatMap((page) =>
      page.organizations.flatMap((org) => {
        if (!org) return []
        return [
          {
            name: org.username,
            activatedUserCount: org.activatedUserCount,
            isCurrentUserPartOfOrg: org.isCurrentUserPartOfOrg,
          } as AccountOrgRow,
        ]
      })
    )
  }, [data])

  const table = useReactTable({
    columns,
    data: accountOrgs,
    state: {
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    manualSorting: true,
  })

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [accountOrgs, inView, hasNextPage, fetchNextPage])

  return (
    <Card>
      <Card.Header>
        <Card.Title size="sm">Account details</Card.Title>
        <Card.Description className="text-sm text-ds-gray-quinary">
          To modify your orgs and seats, please {/* @ts-ignore-error */}
          <A to={{ pageName: 'enterpriseSupport' }}>contact support</A>.
        </Card.Description>
      </Card.Header>
      <Card.Content className="m-0 flex divide-x font-medium">
        <div className="flex-1 p-4">
          <p>Total organizations</p>
          <p className="pt-2 text-xl">{account.organizations.totalCount}</p>
        </div>
        <div className="flex-1 p-4">
          <p>Total seats</p>
          <p className="pt-2 text-xl">{account.totalSeatCount}</p>
        </div>
        <div className="flex-1 p-4">
          <p>Seats remaining</p>
          <p className="pt-2 text-xl">
            {account.totalSeatCount - account.activatedUserCount}
          </p>
        </div>
      </Card.Content>
      <Card.Content className="m-0">
        <div className="tableui">
          <table>
            <colgroup>
              <col className="w-5/6" />
              <col className="w-1/6" />
            </colgroup>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      scope="col"
                      data-sortable={header.column.getCanSort()}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <span
                          className="text-ds-blue-darker group-hover/columnheader:opacity-100"
                          data-sort-direction={header.column.getIsSorted()}
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
                  <td colSpan={2}>
                    <Loader />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) =>
                  row.original.isCurrentUserPartOfOrg ? (
                    <tr key={row.id} className="h-14">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {cell.column.id === 'activatedUserCount' ? (
                            <div className="flex w-full justify-end">
                              {/* @ts-ignore-error */}
                              <A
                                to={{
                                  pageName: 'membersTab',
                                  options: {
                                    owner: encodeURIComponent(
                                      row.original.name
                                    ),
                                    provider,
                                  },
                                }}
                              >
                                {cell.getValue()}
                              </A>
                            </div>
                          ) : (
                            flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )
                          )}
                        </td>
                      ))}
                    </tr>
                  ) : (
                    <tr key={row.id} className="h-14">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  )
                )
              )}
              {isFetchingNextPage ? (
                <tr>
                  <td colSpan={2}>
                    <Loader />
                  </td>
                </tr>
              ) : null}
              {hasNextPage ? <tr ref={ref} /> : null}
            </tbody>
          </table>
        </div>
      </Card.Content>
    </Card>
  )
}
