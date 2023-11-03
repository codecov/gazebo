import { useMutation } from '@tanstack/react-query'
import { useLayoutEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import { useSetCrumbs } from 'pages/PlanPage/context'
import { useAvailablePlans } from 'services/account'
import { useNavLinks } from 'services/navigation'
import { useAddNotification } from 'services/toastNotification'
import Api from 'shared/api'
import { useFlags } from 'shared/featureFlags'
import { shouldDisplayTeamCard } from 'shared/utils/billing'
import A from 'ui/A'
import Button from 'ui/Button'
import Icon from 'ui/Icon'

import TeamPlanCard from './TeamPlanCard'

function SpecialOffer() {
  const { provider, owner } = useParams()
  const history = useHistory()
  const { owner: ownerPath } = useNavLinks()
  const setCrumbs = useSetCrumbs()
  const addToast = useAddNotification()

  useLayoutEffect(() => {
    setCrumbs([
      {
        pageName: 'cancelOrgPlan',
        text: 'Special offer',
      },
    ])
  }, [setCrumbs])

  const { mutate, isLoading } = useMutation({
    mutationFn: (body) =>
      Api.patch({
        provider,
        path: `/${provider}/${owner}/account-details`,
        body,
      }),
    onSuccess: () => {
      addToast({
        type: 'success',
        text: 'Discount successfully applied.',
      })
      history.replace(ownerPath?.path())
    },
    onError: () => {
      addToast({
        type: 'error',
        text: 'Something went wrong while applying discount.',
      })
    },
  })

  const { data: plans } = useAvailablePlans({
    provider,
    owner,
  })
  const { multipleTiers } = useFlags({
    multipleTiers: false,
  })

  if (multipleTiers && shouldDisplayTeamCard({ plans })) {
    return (
      <div className="flex w-3/5 flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">Alternative plan offer</h2>
          <p>
            We&apos;d like to introduce you to our lighter alternative - the
            Team Plan. Enjoy essential features at a reduced cost, tailored for
            those who still want value without the full commitment of our pro
            offering.
          </p>
        </div>
        <TeamPlanCard />
        <A
          variant="blueSeptenary"
          to={{ pageName: 'downgradePlanPage' }}
          hook="proceed-with-basic"
          isExternal={false}
        >
          No thanks, I&apos;ll proceed with cancellation
          <Icon name="chevronRight" variant="solid" size="sm" />
        </A>
      </div>
    )
  }

  return (
    <div className="flex w-5/12 flex-col gap-8">
      <div>
        <h2 className="text-lg font-semibold">
          We&apos;d love to keep you under our umbrella.
        </h2>
        <p>
          Keep enjoying the features that help you analyze your code coverage
          quickly so you can deploy with confidence... for less.
        </p>
      </div>
      <p className="font-semibold">
        Get 30% off Codecov for 6 months! &#127881;
      </p>
      <div className="flex gap-4">
        <Button
          variant="primary"
          hook="apply-30-discount"
          onClick={() => mutate({ applyCancellationDiscount: true })}
          isLoading={isLoading}
        >
          Yes, I&apos;d like 6 months with 30% discount
        </Button>
        <A variant="blueSeptenary" to={{ pageName: 'downgradePlanPage' }}>
          No thanks, I&apos;ll proceed to the basic plan
          <Icon name="chevronRight" variant="solid" size="sm" />
        </A>
      </div>
      <p>
        Questions? <A to={{ pageName: 'sales' }}>Contact Sales</A>
      </p>
    </div>
  )
}

export default SpecialOffer
