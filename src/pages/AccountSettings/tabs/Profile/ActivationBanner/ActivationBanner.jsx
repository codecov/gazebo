import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  useSelfHostedCurrentUser,
  useSelfHostedSeatsConfig,
} from 'services/selfHosted'
import Api from 'shared/api'
import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'
import Spinner from 'ui/Spinner'
import Toggle from 'ui/Toggle'

function NoSeatsContent() {
  return (
    <p>
      You are currently not activated and unable to activate because there are
      no available seats. To resolve this, please contact your admin or email
      <A hook="email success" href="mailto:success@codecov.com">
        success@codecov.com
      </A>
      .
    </p>
  )
}

const Loader = (
  <div className="h-full w-full flex items-center justify-center">
    <Spinner />
  </div>
)

// eslint-disable-next-line max-statements, complexity
function ActivationBanner() {
  const { data: currentUser, isLoading: isLoadingUser } =
    useSelfHostedCurrentUser()
  const { data: seatConfig, isLoading: isLoadingSeats } =
    useSelfHostedSeatsConfig()
  const queryClient = useQueryClient()

  const noSeatsAvailable = seatConfig?.seatsUsed === seatConfig?.seatsLimit

  let displaySeatMsg = false
  let canChange = true
  if (
    !currentUser?.activated &&
    noSeatsAvailable &&
    (!isLoadingUser || !isLoadingSeats)
  ) {
    canChange = false
    displaySeatMsg = true
  }

  const { mutate, isLoading: isLoadingMutation } = useMutation(
    () => {
      if (canChange) {
        return Api.patch({
          path: '/users/current',
          body: { activated: !currentUser?.activated },
        })
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['SelfHostedCurrentUser'])
        queryClient.invalidateQueries(['Seats'])
      },
    }
  )

  if (isLoadingUser || isLoadingSeats || isLoadingMutation) {
    return Loader
  }

  return (
    <Banner>
      <BannerHeading>
        <h2 className="font-semibold">Activation Status</h2>
      </BannerHeading>
      <BannerContent>
        <div className="flex flex-col gap-2">
          <Toggle
            value={currentUser?.activated || false}
            label=""
            onClick={() => mutate()}
            disabled={isLoadingMutation || !canChange}
          />

          {canChange &&
            (currentUser?.activated
              ? 'You are currently activated'
              : 'You are currently not activated')}
          {!isLoadingMutation && displaySeatMsg && <NoSeatsContent />}
        </div>
      </BannerContent>
    </Banner>
  )
}

export default ActivationBanner
