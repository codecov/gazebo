import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import { useParams } from 'react-router'

import { SelfHostedCurrentUserQueryOpts } from 'services/selfHosted/SelfHostedCurrentUserQueryOpts'
import A from 'ui/A'
import Icon from 'ui/Icon'

interface URLParams {
  provider: string
}

function AdminLink() {
  const { provider } = useParams<URLParams>()
  const { data: user } = useSuspenseQueryV5(
    SelfHostedCurrentUserQueryOpts({ provider })
  )

  if (!user?.isAdmin) {
    return null
  }

  return (
    <A
      variant="header"
      to={{ pageName: 'access' }}
      isExternal={false}
      hook="header-admin-link"
    >
      <Icon size="md" name="cog" variant="solid" /> Admin
    </A>
  )
}

export default AdminLink
