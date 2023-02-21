import PropTypes from 'prop-types'

import Card from 'old_ui/Card'
import A from 'ui/A'

import ErasePersonalAccountButton from './ErasePersonalAccountButton'

function DeletionCard({ isPersonalSettings, provider, owner }) {
  return (
    <Card className="p-10 text-codecov-red">
      <h2 className="bold border-b border-codecov-red pb-4 text-2xl">
        Delete account
      </h2>
      {isPersonalSettings ? (
        <>
          <p className="mt-4 mb-6">
            Erase all my personal content and personal projects.
          </p>
          <ErasePersonalAccountButton provider={provider} owner={owner} />
        </>
      ) : (
        <>
          <p className="mt-4 mb-6">
            Erase all my organization content and projects.
          </p>
          <A to={{ pageName: 'support' }}>Contact support</A>
        </>
      )}
    </Card>
  )
}

DeletionCard.propTypes = {
  isPersonalSettings: PropTypes.bool.isRequired,
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
}

export default DeletionCard
