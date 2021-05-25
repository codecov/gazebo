import PropTypes from 'prop-types'
import { useState, Suspense } from 'react'

import { orderingOptions } from 'services/repos'
import qs from 'qs'

import Spinner from 'ui/Spinner'
import OrgControlTable from './OrgControlTable'
import ReposTable from './ReposTable'
import { useLocation, useHistory } from 'react-router-dom'

function ListRepo({ owner }) {
  const [active, setActive] = useState(true)
  const [sortItem, setSortItem] = useState(orderingOptions[0])
  const [searchValue, setSearchValue] = useState('')
  const { pathname } = useLocation()
  const { push } = useHistory()

  function handleQueryChange(item) {
    const queryType = Object.keys(item)[0]
    if (queryType === 'active') setActive(item.queryType)
    else if (queryType === 'sort') setSortItem(item.queryType)
    else if (queryType === 'search') setSearchValue(item.queryType)

    const query = {
      active,
      sort: sortItem,
      search: searchValue,
      ...item,
    }
    push(`${pathname}?${qs.stringify(query)}`)
  }

  const loadingState = (
    <div className="flex justify-center py-8">
      <Spinner />
    </div>
  )

  return (
    <>
      <OrgControlTable
        sortItem={sortItem}
        setSortItem={(sort) => handleQueryChange({ sort })}
        active={active}
        setActive={(active) => handleQueryChange({ active })}
        setSearchValue={(search) => handleQueryChange({ search })}
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
