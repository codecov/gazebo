import { lazy, Suspense, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'
import { ApiFilterEnum, useLocationParams } from 'services/navigation'
import { useUpdateUser } from 'services/users'
import { isFreePlan } from 'shared/utils/billing'
import SearchField from 'ui/SearchField'
import Select from 'ui/Select'
import Spinner from 'ui/Spinner'

import { ActivatedItems, AdminItems } from './enums'
import UpgradeModal from './UpgradeModal/UpgradeModal'

const MembersTable = lazy(() => import('./MembersTable'))

const UserManagementClasses = {
  root: 'space-y-4 col-span-2 mb-20 grow mt-4', // Select pushes page length out. For now padding
  cardHeader: 'flex justify-between items-center pb-4',
  activateUsers:
    'flex items-center py-2 px-4 shadow rounded-full text-blue-500',
  title: 'text-2xl font-bold',
  results: 'shadow divide-y divide-gray-200 divide-solid p-6',
  userTable: 'grid grid-cols-5 lg:gap-2 my-6',
  user: 'col-span-4',
  ctaWrapper: 'flex items-center justify-end gap-2',
  cta: 'w-full truncate',
}

function useActivateUser({ provider, owner }) {
  const { mutate, ...rest } = useUpdateUser({
    provider,
    owner,
  })

  function activate(ownerid, activated) {
    mutate({ targetUserOwnerid: ownerid, activated })
  }

  return { activate, ...rest }
}

const handleActivate = (accountDetails, activate, setIsOpen) => (user) => {
  const maxActivatedUsers = 5

  if (
    accountDetails?.activatedUserCount >= maxActivatedUsers &&
    !user.activated &&
    isFreePlan(accountDetails?.plan?.value)
  ) {
    setIsOpen(true)
  } else {
    activate(user.ownerid, !user.activated)
  }
}

// eslint-disable-next-line max-statements
function MembersList() {
  const { owner, provider } = useParams()
  const { params, updateParams } = useLocationParams({
    activated: ApiFilterEnum.none, // Default to no filter on activated
    isAdmin: ApiFilterEnum.none, // Default to no filter on isAdmin
    ordering: '-name', // Default sort is A-Z Name
    search: '', // Default to no search on initial load
    page: 1, // Default to first page
    pageSize: 50, // Default page size
  })

  const { activate } = useActivateUser({ owner, provider })
  const { data: accountDetails } = useAccountDetails({ owner, provider })
  const [isOpen, setIsOpen] = useState(false)

  return (
    <article className={UserManagementClasses.root}>
      <UpgradeModal isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="mx-4 grid grid-cols-2 items-center gap-4 sm:mx-0 sm:grid-cols-3">
        <Select
          ariaName="members status selector"
          dataMarketing="members-status-selector"
          items={ActivatedItems.map(({ label }) => label)}
          value={
            ActivatedItems.find((value) => value.value === params.activated)
              ?.label
          }
          onChange={(value) => {
            updateParams({
              activated: ActivatedItems.find((v) => v.label === value)?.value,
            })
          }}
        />
        <Select
          ariaName="members role selector"
          dataMarketing="members-role-selector"
          items={AdminItems.map(({ label }) => label)}
          value={
            AdminItems.find((value) => value.value === params.isAdmin)?.label
          }
          onChange={(value) => {
            updateParams({
              isAdmin: AdminItems.find((v) => v.label === value)?.value,
            })
          }}
        />
        <div className="col-span-2 sm:col-span-1">
          <SearchField
            dataMarketing="members-search"
            placeholder="Search"
            searchValue={params?.search || ''}
            setSearchValue={(search) => updateParams({ search })}
            data-testid="search-input-members"
          />
        </div>
      </div>
      <Suspense
        fallback={
          <div className="flex flex-row justify-center">
            <Spinner />
          </div>
        }
      >
        <MembersTable
          handleActivate={handleActivate(accountDetails, activate, setIsOpen)}
          params={params}
        />
      </Suspense>
    </article>
  )
}

export default MembersList
