import { useParams } from 'react-router-dom'

import Card from 'old_ui/Card'
import { useOwner } from 'services/user'
import { Provider } from 'shared/api/helpers'
import A from 'ui/A'
import ExternalId from 'ui/ExternalId'

interface DeletionCardProps {
  isPersonalSettings: boolean
}

interface URLParams {
  provider: Provider
  owner: string
}

function DeletionCard({ isPersonalSettings }: DeletionCardProps) {
  const { owner } = useParams<URLParams>()
  const { data: ownerData } = useOwner({ username: owner })

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">
        {isPersonalSettings ? 'Delete account' : 'Delete organization'}
      </h2>
      <Card>
        <div className="flex flex-col gap-4">
          <p>
            {isPersonalSettings
              ? 'Erase my personal account and all my repositories. '
              : 'Erase organization and all its repositories. '}
            <A
              to={{ pageName: 'support' }}
              hook="contact-support-link"
              isExternal
            >
              Contact support
            </A>
          </p>
          <ExternalId externalId={ownerData?.externalId} label="Owner ID" />
        </div>
      </Card>
    </div>
  )
}

export default DeletionCard
