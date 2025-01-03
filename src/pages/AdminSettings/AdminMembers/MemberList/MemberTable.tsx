import {
  UseMutateFunction,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  useInfiniteQuery as useInfiniteQueryV5,
  useQueryClient as useQueryClientV5,
  useSuspenseQuery as useSuspenseQueryV5,
} from '@tanstack/react-queryV5'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import { useEffect, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'
import { useParams } from 'react-router'

import { useLocationParams } from 'services/navigation'
import { SelfHostedSettingsQueryOpts } from 'services/selfHosted/SelfHostedSettingsQueryOpts'
import {
  SelfHostedUserListQueryOpts,
  UserListOwner,
} from 'services/selfHosted/SelfHostedUserListQueryOpts'
import Api from 'shared/api'
import { Provider } from 'shared/api/helpers'
import Spinner from 'ui/Spinner'
import Toggle from 'ui/Toggle'

type SelfHostedSettings = {
  planAutoActivate?: boolean | null
  seatsUsed?: number | null
  seatsLimit?: number | null
}

type MembersColumns = {
  username: React.ReactNode
  type: string
  email: React.ReactNode
  activationStatus: React.ReactNode
}

const columnHelper = createColumnHelper<MembersColumns>()

const columns = [
  columnHelper.accessor('username', {
    header: 'Username',
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('type', {
    header: () => <span className="flex grow flex-row text-center">Type</span>,
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('activationStatus', {
    header: 'Activation Status',
    cell: ({ renderValue }) => renderValue(),
  }),
]

interface CreateTableArgs {
  tableData: UserListOwner[]
  seatData: SelfHostedSettings
  mutate: UseMutateFunction<any, unknown, MutationArgs, unknown>
}

const createTable = ({ tableData, seatData, mutate }: CreateTableArgs) => {
  return tableData?.map(
    ({ ownerid, activated, email, isAdmin, name, username }) => {
      const maxSeats = seatData?.seatsUsed === seatData?.seatsLimit
      const disableToggle = maxSeats && !activated

      return {
        username: <p>{name || username}</p>,
        type: isAdmin ? 'Admin' : 'Developer',
        email: <p className="max-w-44 break-words">{email}</p>,
        activationStatus: (
          <Toggle
            dataMarketing="handle-members-activation"
            label={activated ? 'Activated' : 'Non-Active'}
            value={activated}
            onClick={() => {
              mutate({ ownerid, activated: !activated })
            }}
            disabled={disableToggle}
          />
        ),
      }
    }
  )
}

interface Params {
  activated?: boolean
  search?: string
  isAdmin?: boolean
}

const useQueryMembersList = (params: Params) => {
  const {
    data: queryData,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isLoading,
  } = useInfiniteQueryV5(SelfHostedUserListQueryOpts(params))

  const flatUsersList = useMemo(
    () => queryData?.pages?.flatMap((page) => page.results) ?? [],
    [queryData?.pages]
  )

  return {
    data: flatUsersList,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isLoading,
  }
}

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

interface URLParams {
  provider: Provider
}

interface MutationArgs {
  activated: boolean
  ownerid: number
}

function MemberTable() {
  const { provider } = useParams<URLParams>()
  const queryClient = useQueryClient()
  const queryClientV5 = useQueryClientV5()
  const { ref, inView } = useInView()
  const { data: seatData } = useSuspenseQueryV5(
    SelfHostedSettingsQueryOpts({ provider })
  )
  const { params } = useLocationParams({
    activated: undefined,
    isAdmin: undefined,
    search: '',
  })

  const { data, isFetchingNextPage, hasNextPage, fetchNextPage, isLoading } =
    useQueryMembersList(params)

  const { mutate } = useMutation({
    mutationFn: ({ activated, ownerid }: MutationArgs) =>
      Api.patch({ path: `/users/${ownerid}`, body: { activated } }),
    useErrorBoundary: true,
    onSuccess: () => {
      queryClientV5.invalidateQueries({
        queryKey: SelfHostedSettingsQueryOpts({ provider }).queryKey,
      })
      queryClient.invalidateQueries(['Seats'])
      queryClientV5.invalidateQueries({
        queryKey: SelfHostedUserListQueryOpts(params).queryKey,
      })
    },
  })

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, inView, hasNextPage])

  const tableContent = useMemo(() => {
    if (!data?.length || !seatData) {
      return []
    }

    return createTable({ tableData: data, seatData, mutate })
  }, [data, mutate, seatData])

  const table = useReactTable({
    columns,
    data: tableContent,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <div className="tableui">
        <table>
          <colgroup>
            <col className="w-3/12 min-w-min" />
            <col className="w-2/12 min-w-min" />
            <col className="w-4/12 min-w-min" />
            <col className="w-3/12 min-w-min" />
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} scope="col">
                    <div
                      className={cs('flex gap-1 items-center justify-start', {
                        'last:justify-end': header.id === 'activationStatus',
                      })}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4}>
                  <Loader />
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <p className="text-center">No members found</p>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td key={cell.id}>
                        <div
                          className={cs(
                            'w-full max-w-0 @md/table:w-auto @md/table:max-w-none',
                            {
                              'flex justify-end':
                                cell.column.id === 'activationStatus',
                            }
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {isFetchingNextPage ? <Loader /> : null}
      {hasNextPage ? <LoadMoreTrigger intersectionRef={ref} /> : null}
    </>
  )
}

export default MemberTable
