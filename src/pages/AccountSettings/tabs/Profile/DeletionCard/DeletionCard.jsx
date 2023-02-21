import PropTypes from 'prop-types'

import Card from 'ui/Card'

import ErasePersonalAccountButton from './ErasePersonalAccountButton'

function DeletionCard({ provider, owner }) {
  return (
    <Card className="p-10 text-codecov-red">
      <h2 className="bold border-b border-ds-primary-red pb-4 text-2xl">
        Delete account
      </h2>
      <>
        <p className="mt-4 mb-6">
          Erase all my personal content and personal projects.
        </p>
        <ErasePersonalAccountButton provider={provider} owner={owner} />
      </>
    </Card>
  )
}

DeletionCard.propTypes = {
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
}

export default DeletionCard
