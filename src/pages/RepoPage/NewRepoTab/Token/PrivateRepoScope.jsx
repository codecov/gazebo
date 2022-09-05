import PropTypes from 'prop-types'

import CopyClipboard from 'ui/CopyClipboard'

const PrivateRepoScope = ({ token }) => (
  <>
    <p className="text-base">
      Copy the below token and set it in your CI environment variables.
    </p>
    <p className="flex flex-row justify-center text-sm mt-4 gap-2">
      Codecov Token={' '}
      <span className="font-mono bg-ds-gray-secondary text-ds-gray-octonary h-auto xl:h-5">
        {token}
      </span>
      <CopyClipboard string={token} />
    </p>
  </>
)

PrivateRepoScope.propTypes = {
  token: PropTypes.string,
}

export default PrivateRepoScope
