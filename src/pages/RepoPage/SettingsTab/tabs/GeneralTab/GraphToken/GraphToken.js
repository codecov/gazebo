import PropTypes from 'prop-types'

import A from 'ui/A'
import SettingsDescriptor from 'ui/SettingsDescriptor'
import TokenWrapper from 'ui/TokenWrapper'

function GraphToken({ graphToken }) {
  return (
    <SettingsDescriptor
      title="Repository graphing token"
      description={
        <span>
          Token is used for viewing graphs{' '}
          <A to={{ pageName: 'graphAuthorization' }} isExternal>
            learn more
          </A>
        </span>
      }
      content={
        <>
          <p>Use this token in API request to repository graphs</p>
          <TokenWrapper token={graphToken} />
        </>
      }
    />
  )
}

GraphToken.propTypes = {
  graphToken: PropTypes.string.isRequired,
}

export default GraphToken
