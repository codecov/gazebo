import PropTypes from 'prop-types'
import { Suspense } from 'react'
import { orderingOptions } from 'services/repos'
import Spinner from 'ui/Spinner'
import OrgControlTable from './OrgControlTable'
import ReposTable from './ReposTable'
import { useLocationParams } from 'services/navigation'
import { useLocation, useHistory } from 'react-router-dom'

const defaultQueryParams = {
  search: '',
  ordering: orderingOptions[0]['ordering'],
  direction: orderingOptions[0]['direction'],
}

function ListRepo({ owner, active }) {
  const { params, updateParams } = useLocationParams(defaultQueryParams)
  const { push } = useHistory()
  const { pathname } = useLocation()

  const sortItem =
    orderingOptions.find(
      (option) =>
        option.ordering === params.ordering &&
        option.direction === params.direction
    ) || orderingOptions[0]

  const loadingState = (
    <div className="flex justify-center py-8">
      <Spinner />
    </div>
  )

  return (
    <>
      <OrgControlTable
        sortItem={sortItem}
        searchValue={params.search}
        setSortItem={(sort) => {
          updateParams({
            ordering: sort.ordering,
            direction: sort.direction,
          })
        }}
        active={active}
        setActive={(active) => {
          if (active) {
            push(pathname.replace('/+', ''))
          } else {
            push(`${pathname}/+`)
          }
        }}
        setSearchValue={(search) => {
          updateParams({ search })
        }}
      />
      <Suspense fallback={loadingState}>
        <ReposTable
          sortItem={sortItem}
          owner={owner}
          active={active}
          searchValue={params.search}
        />
      </Suspense>
    </>
  )
}

ListRepo.propTypes = {
  owner: PropTypes.string,
  active: PropTypes.bool,
}

export default ListRepo
