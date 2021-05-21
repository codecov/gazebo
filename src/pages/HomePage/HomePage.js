import { useState, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import Spinner from 'ui/Spinner'
import { orderingOptions } from 'services/repos'

import Header from './Header'
import OrgControlTable from './OrgControlTable'
import ReposTable from './ReposTable'

function HomePage() {
  const { owner } = useParams()
  const [active, setActive] = useState(true)
  const [sortItem, setSortItem] = useState(orderingOptions[0])
  const [searchValue, setSearchValue] = useState('')

  const loadingState = (
    <div className="flex justify-center py-8">
      <Spinner />
    </div>
  )

  return (
    <>
      <Header owner={owner} />
      <OrgControlTable
        sortItem={sortItem}
        setSortItem={setSortItem}
        active={active}
        setActive={setActive}
        setSearchValue={setSearchValue}
      />
      <Suspense fallback={loadingState}>
        <ReposTable
          sortItem={sortItem}
          owner={owner}
          active={active}
          searchValue={searchValue}
        />
      </Suspense>
    </>
  )
}

export default HomePage
