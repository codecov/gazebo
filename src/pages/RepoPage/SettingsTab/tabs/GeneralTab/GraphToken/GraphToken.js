import PropTypes from 'prop-types'

import A from 'ui/A'
import TokenWrapper from 'ui/TokenWrapper'

function GraphToken({ graphToken }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-semibold">Repository graphing token</h1>
        <p>
          Token is used for viewing graphs{' '}
          <A to={{ pageName: 'graphAuthorization' }} isExternal>
            learn more
          </A>
        </p>
        <hr />
      </div>
      <div className="flex flex-col border-2 border-gray-100 p-4 xl:w-4/5 2xl:w-3/5 gap-4">
        <p>Use this token in API request to repository graphs</p>
        <TokenWrapper token={graphToken} />
      </div>
    </div>
  )
}

GraphToken.propTypes = {
  graphToken: PropTypes.string.isRequired,
}

export default GraphToken
