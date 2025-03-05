import { useLayoutEffect } from 'react'

import { useSetCrumbs } from 'pages/PlanPage/context'
import A from 'ui/A'
import Icon from 'ui/Icon'

import TeamPlanCard from './TeamPlanCard'

function TeamPlanSpecialOffer() {
  const setCrumbs = useSetCrumbs()

  useLayoutEffect(() => {
    setCrumbs([
      {
        pageName: 'cancelOrgPlan',
        text: 'Special offer',
      },
    ])
  }, [setCrumbs])

  return (
    <div className="flex w-3/5 flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Alternative plan offer</h2>
        <p>
          We&apos;d like to introduce you to our Team Plan. Enjoy essential
          features at a reduced cost, tailored for those who still want value
          without the full commitment of our pro offering.
        </p>
      </div>
      <TeamPlanCard />
      <A
        variant="black"
        to={{ pageName: 'downgradePlanPage' }}
        hook="proceed-with-developer-plan"
        isExternal={false}
      >
        No thanks, I&apos;ll proceed with cancellation
        <Icon name="chevronRight" variant="solid" size="sm" />
      </A>
    </div>
  )
}

export default TeamPlanSpecialOffer
