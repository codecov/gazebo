import { Suspense } from 'react'

import { useLocationParams } from 'services/navigation'
import SearchField from 'ui/SearchField'
import Select from 'ui/Select'
import Spinner from 'ui/Spinner'

import MemberTable from './MemberTable'

const ActivationStates = Object.freeze({
  ALL_USERS: { value: 'All Users' },
  ACTIVE: { value: 'Active', state: true },
  NON_ACTIVE: { value: 'Non-Active', state: false },
})

const RoleStates = Object.freeze({
  EVERYONE: { value: 'Everyone' },
  ADMINS: { value: 'Admins', state: true },
  DEVELOPERS: { value: 'Developers', state: false },
})

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

function MemberList() {
  const { params, updateParams } = useLocationParams({
    activated: undefined,
    isAdmin: undefined,
    search: '',
  })

  return (
    <>
      <div className="flex grow flex-row items-center justify-between">
        <div className="w-3/12">
          <Select
            dataMarketing="members-status-selector"
            value={
              ActivationStates[
                Object.keys(ActivationStates).find(
                  (key) => ActivationStates[key]?.state === params.activated
                )
              ]?.value
            }
            items={Object.keys(ActivationStates).map(
              (key) => ActivationStates[key]?.value
            )}
            onChange={(value) =>
              updateParams({
                ...params,
                activated:
                  ActivationStates[
                    Object.keys(ActivationStates).find(
                      (key) => ActivationStates[key]?.value === value
                    )
                  ]?.state,
              })
            }
            ariaName="status selector"
          />
        </div>
        <div className="w-3/12">
          <Select
            dataMarketing="members-role-selector"
            value={
              RoleStates[
                Object.keys(RoleStates).find(
                  (key) => RoleStates[key]?.state === params.isAdmin
                )
              ]?.value
            }
            items={Object.keys(RoleStates).map((key) => RoleStates[key]?.value)}
            onChange={(value) =>
              updateParams({
                ...params,
                isAdmin:
                  RoleStates[
                    Object.keys(RoleStates).find(
                      (key) => RoleStates[key]?.value === value
                    )
                  ]?.state,
              })
            }
            ariaName="role selector"
          />
        </div>
        <div className="w-4/12">
          <SearchField
            dataMarketing="members-search"
            placeholder="Search"
            searchValue={params?.search || ''}
            setSearchValue={(search) => updateParams({ ...params, search })}
            data-testid="search-input-members"
          />
        </div>
      </div>
      <Suspense fallback={<Loader />}>
        <MemberTable />
      </Suspense>
    </>
  )
}

export default MemberList
