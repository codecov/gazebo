/* */
import PropTypes from 'prop-types'
import { Suspense, useContext } from 'react'
import { useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { orderingOptions } from 'services/repos'
import { TierNames, useTier } from 'services/tier'
import { useUser } from 'services/user'
import { ActiveContext } from 'shared/context'
import { useFlags } from 'shared/featureFlags'
import { Alert } from 'ui/Alert'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'

import OrgControlTable from './OrgControlTable'
import ReposTable from './ReposTable'
import ReposTableTeam from './ReposTableTeam'

const defaultQueryParams = {
  search: '',
  ordering: orderingOptions[0]['ordering'],
  direction: orderingOptions[0]['direction'],
  repoDisplay: 'All',
}

export const repoDisplayOptions = Object.freeze({
  CONFIGURED: { text: 'Configured', status: true },
  NOT_CONFIGURED: { text: 'Not Configured', status: false },
  ALL: { text: 'All', status: undefined },
})

function ListRepo({ canRefetch }) {
  const { provider, owner } = useParams()
  const { params, updateParams } = useLocationParams(defaultQueryParams)
  const { data: tierData } = useTier({ provider, owner })
  const { multipleTiers } = useFlags({
    multipleTiers: false,
  })
  const { data: currentUser } = useUser({
    options: {
      suspense: false,
    },
  })

  const showTeamRepos = tierData === TierNames.TEAM && multipleTiers

  const repoDisplay = useContext(ActiveContext)

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

  const cameFromOnboarding = params['source'] === 'onboarding'
  const isMyOwnerPage = currentUser?.user?.username === owner
  const showDemoAlert = cameFromOnboarding && isMyOwnerPage

  return (
    <>
      <OrgControlTable
        searchValue={params.search}
        repoDisplay={repoDisplay}
        setRepoDisplay={(repoDisplay) =>
          updateParams({
            repoDisplay,
          })
        }
        setSearchValue={(search) => {
          updateParams({ search })
        }}
        canRefetch={canRefetch}
      />

      {showDemoAlert ? (
        <div className="mb-6">
          <Alert
            customIcon={
              <Icon
                name="sparkles"
                className="float-left -mt-0.5 mr-2 stroke-blue-500 align-middle"
              ></Icon>
            }
          >
            <Alert.Title>Welcome to Codecov!</Alert.Title>
            <Alert.Description>
              {`We've added you to our Codecov repo to show you a real-world
            coverage example. You can now see how we use the tool.`}
            </Alert.Description>
          </Alert>
        </div>
      ) : null}

      <Suspense fallback={loadingState}>
        {showTeamRepos ? (
          <ReposTableTeam searchValue={params.search} />
        ) : (
          <ReposTable
            sortItem={sortItem}
            owner={owner}
            searchValue={params.search}
            mayIncludeDemo={true}
          />
        )}
      </Suspense>
    </>
  )
}

ListRepo.propTypes = {
  canRefetch: PropTypes.bool.isRequired,
}

export default ListRepo
