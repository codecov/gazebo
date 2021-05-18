import { useState, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import Spinner from 'ui/Spinner'

import Header from './Header'
import OrgControlTable from './OrgControlTable'
import ReposTable from './ReposTable'

const sortItems = [
  'Most recent commit',
  'Least recent commit',
  'Highest coverage',
  'Lowest coverage',
  'Name [A-Z]',
  'Name [Z-A]',
]



function HomePage() {
  const { owner } = useParams()
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
      <Header owner={owner} />
      <OrgControlTable
        sortItem={sortItem}
        setSortItem={setSortItem}
        active={active}
        setActive={setActive}
        setSearchValue={setSearchValue}
      />
      <Suspense fallback={loadingState}>
        <ReposTable owner={owner} active={active} searchValue={searchValue} />
      </Suspense>
    </>
  )
}

export default HomePage
