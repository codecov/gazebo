import { useParams } from 'react-router-dom'

import { useNavLinks } from 'services/navigation'
import { useUser } from 'services/user'
import Icon from 'ui/Icon'

function GithubPrivateScopeLogin() {
  const { provider } = useParams()
  const { signIn } = useNavLinks()
  const { data: currentUser } = useUser({
    suspense: false,
  })

  if (!currentUser || provider !== 'gh' || currentUser.privateAccess) {
    return null
  }

  return (
    <div className="flex items-center mr-4">
      <span className="text-ds-gray-quinary">
        <Icon size="sm" variant="solid" name="globe-alt" />
      </span>
      <span className="ml-1 mr-1 text-ds-gray-quinary">Public repos only</span>
      <a
        className="text-xs font-semibold mt-1 text-ds-blue-darker"
        href={`${signIn.path({ provider })}?private=t`}
      >
        add private
      </a>
    </div>
  )
}

export default GithubPrivateScopeLogin
