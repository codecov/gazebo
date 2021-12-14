import PropTypes from 'prop-types'
import { Suspense } from 'react'
import { orderingOptions, nonActiveOrderingOptions } from 'services/repos'
import Spinner from 'ui/Spinner'
import OrgControlTable from './OrgControlTable'
import ReposTable from './ReposTable'
import { useLocationParams } from 'services/navigation'
import { useHistory } from 'react-router-dom'
import { useNavLinks } from 'services/navigation'
import { ActiveContext } from 'shared/Contexts'
import { useContext } from 'react'

const defaultQueryParams = {
  search: '',
  ordering: orderingOptions[0]['ordering'],
  direction: orderingOptions[0]['direction'],
}

function ListRepo({ owner, canRefetch }) {
  const { params, updateParams } = useLocationParams(defaultQueryParams)
  const { push } = useHistory()
  const {
    owner: ownerLink,
    ownerAddRepo,
    provider: providerLink,
    providerAddRepo,
  } = useNavLinks()

  const active = useContext(ActiveContext)
  const orderOptions = active ? orderingOptions : nonActiveOrderingOptions

  const sortItem =
    orderOptions.find(
      (option) =>
        option.ordering === params.ordering &&
        option.direction === params.direction
    ) || orderOptions[0]

  const loadingState = (
    <div className="flex justify-center py-8">
      <Spinner />
    </div>
  )

  function handleOwnerLinks(active) {
    if (active) {
      push(ownerLink.path())
    } else {
      push(ownerAddRepo.path())
    }
  }

  function handleUserLinks(active) {
    if (active) {
      push(providerLink.path())
    } else {
      push(providerAddRepo.path())
    }
  }

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
          if (owner) {
            handleOwnerLinks(active)
          } else {
            handleUserLinks(active)
          }
        }}
        setSearchValue={(search) => {
          updateParams({ search })
        }}
        canRefetch={canRefetch}
      />
      <Suspense fallback={loadingState}>
        <ReposTable
          sortItem={sortItem}
          owner={owner}
          searchValue={params.search}
        />
      </Suspense>
    </>
  )
}

ListRepo.propTypes = {
  owner: PropTypes.string,
  canRefetch: PropTypes.bool.isRequired,
}

export default ListRepo
