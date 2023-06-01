import isEmpty from 'lodash/isEmpty'
import PropType from 'prop-types'
import { useParams } from 'react-router-dom'

import { useNavLinks } from 'services/navigation'
import { providerToName } from 'shared/utils/provider'

function NoReposBlock({ privateAccess, searchValue }) {
  const { signIn } = useNavLinks()
  const { provider } = useParams()

  if (!isEmpty(searchValue)) {
    return <h1 className="mt-8 text-center text-lg">No results found</h1>
  }

  return (
    <div className="mt-8 text-center">
      <h1 className="text-2xl font-semibold">There are no repos detected</h1>
      {!privateAccess && providerToName(provider) !== 'Github' && (
        <p>
          Try adding{' '}
          <a
            className="text-ds-blue-darker"
            href={`${signIn.path()}?private=true`}
          >
            private scope
          </a>{' '}
          for access to private repos
        </p>
      )}
    </div>
  )
}

NoReposBlock.propTypes = {
  privateAccess: PropType.bool,
  searchValue: PropType.string,
}

export default NoReposBlock
