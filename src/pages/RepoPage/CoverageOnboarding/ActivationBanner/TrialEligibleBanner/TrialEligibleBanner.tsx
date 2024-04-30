import { useParams } from 'react-router-dom'

import { useStartTrial } from 'services/trial'
import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'
import Button from 'ui/Button'

interface URLParams {
  owner: string
}

function TrialEligibleBanner() {
  const { owner } = useParams<URLParams>()
  const { mutate: fireTrial, isLoading } = useStartTrial()

  return (
    <Banner variant="plain">
      <BannerContent>
        <BannerHeading>
          <h2 className="font-semibold">
            Start a free 14-day trial on Pro Team plan &#128640;
          </h2>
        </BannerHeading>
        <div className="flex justify-between">
          <ul className="mb-2 list-inside list-disc">
            <li>Unlimited members</li>
            <li>Unlimited repos</li>
            <li>Unlimited uploads</li>
            <li>Access to all features</li>
            <li>No credit card required</li>
          </ul>
          <div className="flex items-start justify-end">
            <Button
              onClick={() => fireTrial({ owner })}
              hook="trial-eligible-banner-start-trial"
              to={undefined}
              disabled={isLoading}
              variant="primary"
            >
              Start Trial
            </Button>
          </div>
        </div>
        <span className="text-ds-gray-quinary">
          Plan limits reached, you can{' '}
          <A
            to={{
              pageName: 'upgradeOrgPlan',
            }}
            hook="trial-eligible-banner-to-upgrade-page"
            isExternal={false}
          >
            upgrade
          </A>{' '}
          or{' '}
          <A
            to={{
              pageName: 'membersTab',
            }}
            hook="trial-eligible-banner-to-manage-members-page"
            isExternal={false}
          >
            manage members
          </A>
          .
        </span>
      </BannerContent>
    </Banner>
  )
}

export default TrialEligibleBanner
