import { Suspense } from 'react'
import { useParams } from 'react-router-dom'

import GithubConfigBanner from 'pages/OwnerPage/HeaderBanners/GithubConfigBanner'
import { ONBOARDING_SOURCE } from 'pages/TermsOfService/constants'
import { useLocationParams } from 'services/navigation'
import { orderingOptions } from 'services/repos/orderingOptions'
import { useIsTeamPlan } from 'services/useIsTeamPlan'
import { useIsCurrentUserAnAdmin, useUser } from 'services/user'
import { Provider } from 'shared/api/helpers'
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

interface ListRepoProps {
  hasGhApp?: boolean
}

interface URLParams {
  provider: Provider
  owner: string
}

function ListRepo({ hasGhApp }: ListRepoProps) {
  const { provider, owner } = useParams<URLParams>()
  const { params, updateParams } = useLocationParams(defaultQueryParams)
  // @ts-expect-error useLocationParams needs to be typed
  const { search, source } = params
  const { data: isTeamPlan } = useIsTeamPlan({ provider, owner })
  const { data: currentUser } = useUser({
    options: {
      suspense: false,
    },
  })
  const isAdmin = useIsCurrentUserAnAdmin({ owner })

  const loadingState = (
    <div className="flex justify-center py-8">
      <Spinner />
    </div>
  )

  const cameFromOnboarding = source === ONBOARDING_SOURCE
  const isMyOwnerPage = currentUser?.user?.username === owner
  const showDemoAlert = cameFromOnboarding && isMyOwnerPage

  return (
    <>
      {/* we only want one of this or DemoAlert banners to show at a time */}
      {isAdmin && !hasGhApp && !showDemoAlert ? <GithubConfigBanner /> : null}
      <OrgControlTable
        searchValue={search}
        setSearchValue={(search) => {
          updateParams({ search })
        }}
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
          <ReposTableTeam searchValue={search} />
        ) : (
          <ReposTable owner={owner} searchValue={search} mayIncludeDemo />
        )}
      </Suspense>
    </>
  )
}

export default ListRepo
