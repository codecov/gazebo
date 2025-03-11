import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useParams } from 'react-router-dom'

import { usePlanData } from 'services/account/usePlanData'
import { Member, useInfiniteUsers, useUpdateUser } from 'services/users'
import { getOwnerImg } from 'shared/utils/ownerHelpers'
import Avatar, { DefaultAuthor } from 'ui/Avatar'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'
import Toggle from 'ui/Toggle'

const Loader = () => (
  <div className="mb-4 flex justify-center pt-4">
    <Spinner />
  </div>
)

const columnHelper = createColumnHelper<Member>()

interface UsernameProps {
  name: string | null
  username: string | null
}

function Username({ name, username }: UsernameProps) {
  const { provider } = useParams<{ provider: string }>()
  const user = {
    avatarUrl: getOwnerImg(provider, username) || DefaultAuthor.AVATAR_URL,
    username: username || DefaultAuthor.USERNAME,
  }

  return (
    <div className="flex flex-1 flex-row items-center gap-3 truncate">
      <Avatar user={user} />
      {name ?? username}
    </div>
  )
}

function useActivateUser({
  provider,
  owner,
}: {
  provider: string
  owner: string
}) {
  const { mutate, ...rest } = useUpdateUser({
    provider,
    owner,
  })

  function activate(ownerid: number, activated: boolean) {
    mutate({ targetUserOwnerid: ownerid, activated })
  }

  return { activate, ...rest }
}

interface ActivationStatusProps {
  activated: boolean
  ownerid: number
  student: boolean
  openUpgradeModal: () => void
}

function ActivationStatus({
  activated,
  ownerid,
  student,
  openUpgradeModal,
}: ActivationStatusProps) {
  const { provider, owner } = useParams<{ provider: string; owner: string }>()
  const { activate, isLoading } = useActivateUser({ owner, provider })
  const { data: planData } = usePlanData({ owner, provider })

  let disabled = false

  if (planData?.plan) {
    disabled = !planData?.plan?.hasSeatsLeft && !planData?.plan?.isFreePlan
  }

  if (student) {
    disabled = false
  }
  return (
    <Toggle
      dataMarketing="handle-members-activation"
      label={activated ? 'Activated' : 'Non-Active'}
      value={activated}
      onClick={() => {
        if (
          !planData?.plan?.hasSeatsLeft &&
          !activated &&
          planData?.plan?.isFreePlan &&
          !student
        ) {
          openUpgradeModal()
        } else {
          activate(ownerid, !activated)
        }
      }}
      isLoading={isLoading}
      disabled={disabled && !activated}
    />
  )
}

function getColumns({ openUpgradeModal }: { openUpgradeModal: () => void }) {
  return [
    columnHelper.accessor('username', {
      id: 'username',
      header: () => 'Username',
      cell: ({ row }) => <Username {...row.original} />,
    }),
    columnHelper.accessor('isAdmin', {
      id: 'isAdmin',
      header: () => 'Type',
      cell: ({ renderValue }) => (
        <p className="truncate">{renderValue() ? 'Admin' : 'Developer'}</p>
      ),
    }),
    columnHelper.accessor('email', {
      id: 'email',
      header: () => 'Email',
      cell: ({ renderValue }) => (
        <p className="w-40 truncate">{renderValue()}</p>
      ),
    }),
    columnHelper.accessor('activated', {
      id: 'activated',
      header: () => 'Activation status',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ActivationStatus
            {...row.original}
            openUpgradeModal={openUpgradeModal}
          />
        </div>
      ),
    }),
  ]
}

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

function getOrderingDirection(sorting: Array<{ id: string; desc: boolean }>) {
  const state = sorting[0]
  return state ? (state.desc ? `-${state.id}` : state.id) : undefined
}

interface MembersTableProps {
  openUpgradeModal: () => void
  params?: {
    activated?: boolean
    isAdmin?: boolean
    ordering?: string[]
    search?: string
    pageSize: number
  }
}

export default function MembersTable({
  openUpgradeModal,
  params,
}: MembersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'username',
      desc: false,
    },
  ])
  const { owner, provider } = useParams<{ owner: string; provider: string }>()
  const { ref, inView } = useInView()

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useInfiniteUsers(
      {
        provider,
        owner,
        query: {
          ...params,
          ordering: getOrderingDirection(sorting),
        },
      },
      { suspense: false }
    )

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  const table = useReactTable({
    columns: getColumns({ openUpgradeModal }),
    data: data || [],
    state: {
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="tableui">
      <table>
        <colgroup>
          <col className="w-full @sm/table:w-10/12" />
          <col className="@sm/table:w-2/12" />
        </colgroup>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  data-sortable={header.column.getCanSort()}
                  {...(header.column.id !== 'isAdmin'
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
