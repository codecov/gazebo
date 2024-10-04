import { useSelfHostedCurrentUser } from 'services/selfHosted'
import A from 'ui/A'
import Icon from 'ui/Icon'

function AdminLink() {
  const { data: user } = useSelfHostedCurrentUser()

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
