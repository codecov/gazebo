import PropTypes from 'prop-types'
import { useState, Suspense } from 'react'

import { orderingOptions } from 'services/repos'

import Spinner from 'ui/Spinner'
import OrgControlTable from './OrgControlTable'
import ReposTable from './ReposTable'

function ListRepo({ owner }) {
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

ListRepo.propTypes = {
  owner: PropTypes.string,
}

export default ListRepo
