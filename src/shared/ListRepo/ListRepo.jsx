/* */
import PropTypes from 'prop-types'
import { Suspense, useContext } from 'react'
import { useHistory } from 'react-router-dom'

import { useLocationParams, useNavLinks } from 'services/navigation'
import { nonActiveOrderingOptions, orderingOptions } from 'services/repos'
import { ActiveContext } from 'shared/context'
import Spinner from 'ui/Spinner'

import OrgControlTable from './OrgControlTable'
import ReposTable from './ReposTable'

const defaultQueryParams = {
  search: '',
  ordering: orderingOptions[0]['ordering'],
  direction: orderingOptions[0]['direction'],
}

export const repoDisplayOptions = Object.freeze({
  ACTIVE: { text: 'Active', status: true },
  INACTIVE: { text: 'Inactive', status: false },
  ALL: { text: 'All', status: null },
})

function ListRepo({ owner, canRefetch }) {
  const { params, updateParams } = useLocationParams(defaultQueryParams)
  const { push } = useHistory()
  const {
    owner: ownerLink,
    ownerInactiveRepos,
    ownerActiveRepos,
    provider: providerLink,
    providerActiveRepos,
    providerInactiveRepos,
  } = useNavLinks()

  const repoDisplay = useContext(ActiveContext)

  const orderOptions =
    repoDisplay === repoDisplayOptions.ACTIVE.text
      ? orderingOptions
      : nonActiveOrderingOptions

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

  function handleOwnerLinks(repoDisplay) {
    if (repoDisplay === repoDisplayOptions.ACTIVE.text) {
      push(ownerActiveRepos.path())
    } else if (repoDisplay === repoDisplayOptions.INACTIVE.text) {
      push(ownerInactiveRepos.path())
    } else {
      push(ownerLink.path())
    }
  }

  function handleUserLinks(repoDisplay) {
    if (repoDisplay === repoDisplayOptions.ACTIVE.text) {
      push(providerActiveRepos.path())
    } else if (repoDisplay === repoDisplayOptions.INACTIVE.text) {
      push(providerInactiveRepos.path())
    } else {
      push(providerLink.path())
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
        repoDisplay={repoDisplay}
        setRepoDisplay={(repoDisplay) => {
          if (owner) {
            handleOwnerLinks(repoDisplay)
          } else {
            handleUserLinks(repoDisplay)
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
