import { useParams } from 'react-router-dom'

import { useOwner } from 'services/user'
import { Provider } from 'shared/api/helpers'
import ExternalId from 'ui/ExternalId'

interface URLParams {
  provider: Provider
  owner: string
}

// Shows the active owner's support external ID in the header, next to the
// theme toggle. `useOwner` is disabled when there's no `owner` route param,
// so this renders nothing on pages without an owner context.
function OwnerExternalId() {
  const { owner } = useParams<URLParams>()
  const { data: activeContext } = useOwner({ username: owner })

  return <ExternalId externalId={activeContext?.externalId} label="Owner ID" />
}

export default OwnerExternalId
