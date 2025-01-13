import { useParams } from 'react-router'

import { eventTracker } from 'services/events/events'
import { Provider } from 'shared/api/helpers'
import A from 'ui/A'

function InactiveRepo({
  owner,
  isActive,
  repoName,
  isCurrentUserPartOfOrg,
}: {
  owner: string
  isActive: boolean
  repoName?: string
  isCurrentUserPartOfOrg?: boolean
}) {
  const { provider } = useParams<{ provider: Provider }>()
  if (isActive) return <>Deactivated</>
  if (!isCurrentUserPartOfOrg) return <>Inactive</>

  return (
    <A
      variant="configure"
      isExternal={false}
      hook="configure-link"
      to={{
        pageName: 'new',
        options: {
          owner,
          repo: repoName,
        },
      }}
      onClick={() =>
        eventTracker(provider, owner, repoName).track({
          type: 'Button Clicked',
          properties: {
            buttonType: 'Configure Repo',
          },
        })
      }
    >
      Configure
    </A>
  )
}

export default InactiveRepo
