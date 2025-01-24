/* */
import PropTypes from 'prop-types'
import { Suspense, useContext } from 'react'
import { useParams } from 'react-router-dom'

import GithubConfigBanner from 'pages/OwnerPage/HeaderBanners/GithubConfigBanner'
import { ONBOARDING_SOURCE } from 'pages/TermsOfService/constants'
import { useLocationParams } from 'services/navigation'
import { orderingOptions } from 'services/repos/orderingOptions'
import { useIsTeamPlan } from 'services/useIsTeamPlan'
import { useUser } from 'services/user'
import { ActiveContext } from 'shared/context'
import { Alert } from 'ui/Alert'
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

function ListRepo({ canRefetch, hasGhApp }) {
  const { provider, owner } = useParams()
  const { params, updateParams } = useLocationParams(defaultQueryParams)
  const { data: isTeamPlan } = useIsTeamPlan({ provider, owner })
  const { data: currentUser } = useUser({
    options: {
      suspense: false,
    },
  })

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

  const cameFromOnboarding = params['source'] === ONBOARDING_SOURCE
  const isMyOwnerPage = currentUser?.user?.username === owner
  const showDemoAlert = cameFromOnboarding && isMyOwnerPage

  return (
    <>
      {/* we only want one of these two banners to show at a time */}
      {!hasGhApp && !showDemoAlert && <GithubConfigBanner />}
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
          <Alert variant="info" customIconName="sparkles">
            <Alert.Title>Welcome to Codecov!</Alert.Title>
            <Alert.Description>
              {`We've added you to our Codecov repo to show you a real-world
            coverage example. You can now see how we use the tool.`}
            </Alert.Description>
          </Alert>
        </div>
      ) : null}

      <Suspense fallback={loadingState}>
        {isTeamPlan ? (
          <ReposTableTeam searchValue={params.search} />
        ) : (
          <ReposTable
            sortItem={sortItem}
            owner={owner}
            searchValue={params.search}
            mayIncludeDemo
          />
        )}
      </Suspense>
    </>
  )
}

ListRepo.propTypes = {
  canRefetch: PropTypes.bool.isRequired,
  hasGhApp: PropTypes.bool,
}

export default ListRepo
