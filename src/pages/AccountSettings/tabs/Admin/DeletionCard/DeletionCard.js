import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import { useStaticNavLinks } from 'services/navigation'
import Card from 'old_ui/Card'
import Button from 'old_ui/Button'

import ErasePersonalAccountButton from './ErasePersonalAccountButton'

function DeletionCard({ isPersonalSettings, provider, owner }) {
  const { support } = useStaticNavLinks()
  return (
    <Card className="p-10 text-codecov-red">
      <h2 className="border-b text-2xl pb-4 bold border-codecov-red">
        Danger!
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
          <Button
            Component={Link}
            to={support.path()}
            useRouter={!support.isExternalLink}
            color="red"
          >
            Contact support
          </Button>
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
