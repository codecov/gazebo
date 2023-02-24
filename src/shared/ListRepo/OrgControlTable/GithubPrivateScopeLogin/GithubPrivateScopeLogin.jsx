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

  if (!currentUser || provider !== 'gh' || currentUser?.privateAccess) {
    return null
  }

  return (
    <div className="mr-4 flex items-center">
      <span className="text-ds-gray-quinary">
        <Icon size="sm" variant="solid" name="globe-alt" />
      </span>
      <span className="mx-1 text-ds-gray-quinary">Public repos only</span>
      <a
        className="mt-1 text-xs font-semibold text-ds-blue-darker"
        href={`${signIn.path()}?private=true`}
      >
        add private
      </a>
    </div>
  )
}

export default GithubPrivateScopeLogin
