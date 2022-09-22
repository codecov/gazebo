/* eslint-disable complexity */
import { lazy, Suspense } from 'react'

import { useLocationParams } from 'services/navigation'
import SearchField from 'ui/SearchField'
import Select from 'ui/Select'
import Spinner from 'ui/Spinner'

const MemberTable = lazy(() => import('./MemberTable'))

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
      <div className="flex flex-row grow justify-between items-center">
        <div className="w-3/12">
          <Select
            value={
              typeof params.activated === 'undefined'
                ? 'All Users'
                : params.activated
                ? 'Active'
                : 'Non-Active'
            }
            items={['All Users', 'Active', 'Non-Active']}
            onChange={(item) => {
              let activated
              if (item === 'Active') {
                activated = true
              } else if (item === 'Non-Active') {
                activated = false
              } else {
                activated = undefined
              }

              updateParams({ ...params, activated })
            }}
            ariaName=""
          />
        </div>
        <div className="w-3/12">
          <Select
            value={
              typeof params.isAdmin === 'undefined'
                ? 'Everyone'
                : params.isAdmin
                ? 'Admins'
                : 'Developers'
            }
            items={['Everyone', 'Admins', 'Developers']}
            onChange={(item) => {
              let isAdmin
              if (item === 'Admins') {
                isAdmin = true
              } else if (item === 'Developers') {
                isAdmin = false
              } else {
                isAdmin = undefined
              }

              updateParams({ ...params, isAdmin })
            }}
            ariaName=""
          />
        </div>
        <div className="w-4/12">
          <SearchField
            placeholder={'Search'}
            searchValue={params?.search || ''}
            setSearchValue={(search) => updateParams({ ...params, search })}
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
