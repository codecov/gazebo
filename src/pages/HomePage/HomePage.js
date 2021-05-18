import MyContextSwitcher from 'layouts/MyContextSwitcher'
import { useState, Suspense } from 'react'

import OrgControlTable from './OrgControlTable'
import ReposTable from './ReposTable'
import Spinner from 'ui/Spinner'

const sortItems = [
  'Most recent commit',
  'Least recent commit',
  'Highest coverage',
  'Lowest coverage',
  'Name [A-Z]',
  'Name [Z-A]',
]

function HomePage() {
  const [active, setActive] = useState(true)
  const [sortItem, setSortItem] = useState(sortItems[0])
  const [searchValue, setSearchValue] = useState('')

  const loadingState = (
    <div className="flex justify-center py-8">
      <Spinner />
    </div>
  )

  return (
    <>
      <MyContextSwitcher
        pageName="ownerInternal"
        pageNameCurrentUser="providerInternal"
      />
      <OrgControlTable
        sortItem={sortItem}
        setSortItem={setSortItem}
        active={active}
        setActive={setActive}
        setSearchValue={setSearchValue}
      />
      <Suspense fallback={loadingState}>
        <ReposTable active={active} searchValue={searchValue} />
      </Suspense>
    </>
  )
}

export default HomePage
