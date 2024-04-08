import { useQueryClient } from '@tanstack/react-query'

import {
  useSelfHostedCurrentUser,
  useSelfHostedSeatsConfig,
} from 'services/selfHosted'
import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'
import Toggle from 'ui/Toggle'

import { useSelfActivationMutation } from './useSelfActivationMutation'

function NoSeatsContent() {
  return (
    <p>
      You are currently not activated and unable to activate because there are
      no available seats. To resolve this, please contact your admin or email
      <A hook="email-sales-no-seats" href="mailto:sales@codecov.io">
        sales@codecov.io
      </A>
      .
    </p>
  )
}

function canChangeActivation({ seatConfig, currentUser }) {
  const noSeatsAvailable = seatConfig?.seatsUsed === seatConfig?.seatsLimit

  let displaySeatMsg = false
  let canChange = true
  if (!currentUser?.activated && noSeatsAvailable) {
    canChange = false
    displaySeatMsg = true
  }

  return { canChange, displaySeatMsg }
}

function ActivationBanner() {
  const queryClient = useQueryClient()
  const { data: currentUser } = useSelfHostedCurrentUser()
  const { data: seatConfig } = useSelfHostedSeatsConfig()

  const { canChange, displaySeatMsg } = canChangeActivation({
    seatConfig,
    currentUser,
  })

  const { mutate } = useSelfActivationMutation({
    queryClient,
    canChange,
  })

  return (
    <Banner>
      <BannerHeading>
        <h2 className="font-semibold">Activation Status</h2>
      </BannerHeading>
      <BannerContent>
        <div className="flex flex-col gap-2">
          <Toggle
            dataMarketing="self-hosted-activation-status"
            value={!!currentUser?.activated}
            label=""
            onClick={() => mutate(!currentUser?.activated)}
            disabled={!canChange}
          />

          {canChange &&
            (currentUser?.activated
              ? 'You are currently activated'
              : 'You are currently not activated')}
          {displaySeatMsg && <NoSeatsContent />}
        </div>
      </BannerContent>
    </Banner>
  )
}

export default ActivationBanner
