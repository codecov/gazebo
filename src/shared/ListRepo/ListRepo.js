import PropTypes from 'prop-types'
import { Suspense } from 'react'
import { orderingOptions } from 'services/repos'
import Spinner from 'ui/Spinner'
import OrgControlTable from './OrgControlTable'
import ReposTable from './ReposTable'
import { useLocationParams } from 'services/navigation'

const defaultQueryParams = {
  active: true,
  search: '',
  ordering: orderingOptions[0]['ordering'],
  direction: orderingOptions[0]['direction'],
}

function ListRepo({ owner }) {
  const { params, updateParams } = useLocationParams(defaultQueryParams)

  const sortItem = orderingOptions.find(
    (option) =>
      option.ordering === params.ordering &&
      option.direction === params.direction
  )

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
        active={params.active}
        setActive={(active) => {
          updateParams({ active })
        }}
        setSearchValue={(search) => {
          updateParams({ search })
        }}
      />
      <Suspense fallback={loadingState}>
        <ReposTable
          sortItem={sortItem}
          owner={owner}
          active={params.active}
          searchValue={params.search}
        />
      </Suspense>
    </>
  )
}

ListRepo.propTypes = {
  owner: PropTypes.string,
}

export default ListRepo
