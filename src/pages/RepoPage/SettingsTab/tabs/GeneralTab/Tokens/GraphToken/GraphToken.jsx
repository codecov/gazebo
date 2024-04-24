import PropTypes from 'prop-types'

import A from 'ui/A'
import TokenWrapper from 'ui/TokenWrapper'

function GraphToken({ graphToken }) {
  if (!graphToken) {
    return null
  }

  return (
    <div className="flex flex-col border-2 border-ds-gray-primary p-4">
      <h3 className="font-semibold">Graphing token</h3>
      <p>
        Use token in API request to repository graphs{' '}
        <A to={{ pageName: 'graphAuthorization' }} isExternal>
          learn more
        </A>
      </p>
      <div className="mt-4">
        <TokenWrapper token={graphToken} />
      </div>
    </div>
  )
}

GraphToken.propTypes = {
  graphToken: PropTypes.string,
}

export default GraphToken
