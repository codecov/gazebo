import PropTypes from 'prop-types'

import Card from 'old_ui/Card'
import A from 'ui/A'

import ErasePersonalAccountButton from './ErasePersonalAccountButton'

function EraseSection({ isPersonalSettings }) {
  if (isPersonalSettings) {
    return (
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Remove my account content</h3>
          <p>Erase all my personal content and personal projects.</p>
        </div>
        <ErasePersonalAccountButton />
      </div>
    )
  }
  return (
    <p>
      Erase all my organization content and projects.{' '}
      <A to={{ pageName: 'support' }}>Contact support</A>
    </p>
  )
}

EraseSection.propTypes = {
  isPersonalSettings: PropTypes.bool,
}

function DeletionCard({ isPersonalSettings }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Delete account</h2>
      <Card>
        <EraseSection isPersonalSettings={isPersonalSettings} />
      </Card>
    </div>
  )
}

DeletionCard.propTypes = {
  isPersonalSettings: PropTypes.bool.isRequired,
}

export default DeletionCard
