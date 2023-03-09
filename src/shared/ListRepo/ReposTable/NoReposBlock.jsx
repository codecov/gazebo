import isEmpty from 'lodash/isEmpty'
import isNull from 'lodash/isNull'
import PropType from 'prop-types'

import { useNavLinks } from 'services/navigation'

function NoReposBlock({ privateAccess, searchValue }) {
  const { signIn } = useNavLinks()

  if (!isEmpty(searchValue)) {
    return <h1 className="mt-8 text-center text-lg">No results found</h1>
  }

  const showPrivatePrompt = isNull(privateAccess) || privateAccess === false

  return (
    <div className="mt-8 text-center">
      <h1 className="text-3xl font-semibold">There are no repos detected</h1>
      {showPrivatePrompt && (
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
