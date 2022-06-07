import PropTypes from 'prop-types'

import A from 'ui/A'

function CurrentRepoSettings({ botUsername, defaultBranch }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold">Current repository settings</h3>
      <p>
        Current bot: {botUsername}{' '}
        <A to={{ pageName: 'teamBot' }}>learn more</A>
      </p>
      <p>Current default branch: {defaultBranch}</p>
    </div>
  )
}

CurrentRepoSettings.propTypes = {
  botUsername: PropTypes.string,
  defaultBranch: PropTypes.string.isRequired,
}

export default CurrentRepoSettings
