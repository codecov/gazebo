import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useParams } from 'react-router-dom'

import { useInfiniteUsers, useUpdateUser } from 'services/users'
import { getOwnerImg } from 'shared/utils'
import Avatar, { DefaultAuthor } from 'ui/Avatar'
import Button from 'ui/Button'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'

const Loader = () => (
  <div className="mb-4 flex justify-center pt-4">
    <Spinner />
  </div>
)

function LoadMoreTrigger({
  intersectionRef,
}: {
  intersectionRef: React.Ref<HTMLSpanElement>
}) {
  return (
    <span
      ref={intersectionRef}
      className="invisible relative top-[-65px] block leading-[0]"
    >
      Loading
    </span>
  )
}

type AdminTableColumn = {
  username: ReactNode
  email: string | null
  revoke: ReactNode
}

const columnHelper = createColumnHelper<AdminTableColumn>()
const columns = [
  columnHelper.accessor('username', {
    header: 'Username',
    cell: (cell) => cell.renderValue(),
  }),
  columnHelper.accessor('email', { header: 'Email' }),
  columnHelper.accessor('revoke', {
    enableSorting: false,
    header: '',
    cell: (cell) => cell.renderValue(),
  }),
]

function getOrderingDirection(sorting: Array<{ id: string; desc: boolean }>) {
  const state = sorting[0]
  return state ? (state.desc ? `-${state.id}` : state.id) : undefined
}

type URLParams = {
  provider: string
  owner: string
}

export default function AdminTable() {
  const { provider, owner } = useParams<URLParams>()
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'username',
      desc: false,
    },
  ])

  const { ref, inView } = useInView()
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteUsers(
      {
        provider,
        owner,
        query: {
          isAdmin: true,
          ordering: getOrderingDirection(sorting),
        },
      },
      {
        suspense: false,
      }
    )
  const { mutate, isLoading: isUpdatingUser } = useUpdateUser({
    provider,
    owner,
    opts: { isAdmin: true },
  })

  const tableData = useMemo(
    () =>
      data?.map(
        (user) =>
          ({
            username: (
              <div className="flex items-center gap-2">
                <Avatar
                  user={
                    user.username
                      ? {
                          username: user.username,
                          avatarUrl: getOwnerImg(provider, user.username),
                        }
                      : {
                          username: DefaultAuthor.USERNAME,
                          avatarUrl: DefaultAuthor.AVATAR_URL,
                        }
                  }
                  ariaLabel={`${user.username ?? user.name}-avatar`}
                />
                <p>{user.username ?? user.name}</p>
              </div>
            ),
            email: user.email,
            revoke: (
              <>
                {/* @ts-expect-error */}
                <Button
                  hook="toggle admin status"
                  disabled={isUpdatingUser}
                  onClick={() => {
                    mutate({
                      targetUserOwnerid: user.ownerid,
                      isAdmin: false,
                    })
                  }}
                >
                  Revoke
                </Button>
              </>
            ),
          }) as AdminTableColumn
      ),
    [provider, data, isUpdatingUser, mutate]
  )

  const table = useReactTable({
    columns,
    data: tableData ?? [],
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
  }, [inView, hasNextPage, fetchNextPage])

  if (!isLoading && !tableData?.length) {
    return (
      <p>
        No admins yet. Note that admins in your Github organization are
        automatically considered admins.
      </p>
    )
  }

  return (
    <div className="tableui">
      <table>
        <colgroup>
          <col className="w-1/3" />
          <col className="w-full" />
          <col />
        </colgroup>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  data-sortable={header.column.getCanSort()}
                  {...(header.column.id !== 'revoke'
                    ? { onClick: header.column.getToggleSortingHandler() }
                    : {})}
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
              <td>
                <Loader />
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {isFetchingNextPage ? <Loader /> : null}
      {hasNextPage ? <LoadMoreTrigger intersectionRef={ref} /> : null}
    </div>
  )
}
