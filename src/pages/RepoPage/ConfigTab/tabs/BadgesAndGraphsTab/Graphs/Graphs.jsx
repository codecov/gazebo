import PropTypes from 'prop-types'

import A from 'ui/A'
import SettingsDescriptor from 'ui/SettingsDescriptor'
import TokenWrapper from 'ui/TokenWrapper'

import URLEmbed from './URLEmbed'

function Graphs({ graphToken }) {
  return (
    <div className="flex flex-col gap-5">
      <SettingsDescriptor
        title="Graphs"
        content={
          <>
            <h3 className="font-semibold">Embed via API</h3>
            <p>
              Use this token to view graphs and images for third party dashboard
              usage. <A to={{ pageName: 'graphsSunburst' }}>Learn more</A>
            </p>
            <TokenWrapper token={graphToken} />
          </>
        }
      />
      <URLEmbed graphToken={graphToken} />
    </div>
  )
}

Graphs.propTypes = {
  graphToken: PropTypes.string.isRequired,
}

export default Graphs
