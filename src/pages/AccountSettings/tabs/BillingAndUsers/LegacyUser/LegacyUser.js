import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import Card from 'old_ui/Card'
import Button from 'old_ui/Button'
import { useNavLinks, useStaticNavLinks } from 'services/navigation'
import { accountDetailsPropType } from 'services/account'

import PaymentCard from '../PaymentCard'
import LatestInvoiceCard from '../LatestInvoiceCard'

function LegacyUser({ accountDetails, provider, owner }) {
  const { upgradePlan } = useNavLinks()
  const { freshdesk } = useStaticNavLinks()

  return (
    <div className="flex">
      <Card className="flex-grow max-w-xl mr-4 px-12 py-10 pb-4">
        <h3 className="text-lg text-pink-500 font-bold">
          Per Repository Billing
        </h3>
        <h2 className="text-4xl uppercase bold">legacy plan</h2>
        <hr className="mt-4" />
        <p className="mt-4 text-gray-500">
          You’re on a legacy per repository plan, these plans are no longer
          supported by Codecov, if you need help managing your plan please reach
          out to
          <a
            className="underline hover:text-blue-600"
            target="_blank"
            rel="noreferrer"
            href={freshdesk.path()}
          >
            support
          </a>
          .
        </p>
        <p className="mt-4 text-gray-900 text-xl bold">
          {accountDetails.nbActivePrivateRepos}/
          {accountDetails.repoTotalCredits} Repositories used
        </p>

        <hr className="my-6" />

        <div className="flex flex-col items-center mt-6">
          <Button
            Component={Link}
            to={upgradePlan.path()}
            useRouter={!upgradePlan.isExternalLink}
          >
            Upgrade to per user pricing
          </Button>
          <p className="mt-4 text-gray-900">
            Questions?{' '}
            <a
              className="underline hover:text-blue-600"
              target="_blank"
              rel="noreferrer"
              href={freshdesk.path()}
            >
              {freshdesk.text}
            </a>
            .
          </p>
        </div>
      </Card>
      <div>
        <PaymentCard
          subscriptionDetail={accountDetails.subscriptionDetail}
          provider={provider}
          owner={owner}
        />
        <LatestInvoiceCard
          invoice={accountDetails.subscriptionDetail?.latestInvoice}
        />
      </div>
    </div>
  )
}

LegacyUser.propTypes = {
  accountDetails: accountDetailsPropType.isRequired,
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
}

export default LegacyUser
