import cs from 'classnames'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useMyContexts } from 'services/user'
import Avatar from 'ui/Avatar'
import Button from 'ui/Button'
import Modal from 'ui/Modal'

function useOrganizations() {
  const { provider } = useParams()
  const { data: myContexts } = useMyContexts({ provider })
  const { currentUser, myOrganizations } = myContexts

  return {
    organizations: [
      {
        organization: currentUser,
      },
      ...myOrganizations.map((organization) => ({
        organization,
      })),
    ],
  }
}

function Organizations({
  organizations,
  defaultOrgUsername,
  setDefaultOrgUsername,
}) {
  return (
    <ul className="text-ds-gray-octonary divide-y border border-ds-gray-secondary">
      {organizations.map(({ organization }) => {
        const currentOrgUsername = organization?.username
        return (
          <li
            key={currentOrgUsername}
            className={cs(
              'flex p-4 hover:bg-ds-gray-primary transition duration-150 cursor-pointer',
              {
                'hover:bg-ds-blue-selected bg-ds-blue-selected':
                  defaultOrgUsername === currentOrgUsername,
              }
            )}
            onClick={() => setDefaultOrgUsername(currentOrgUsername)}
          >
            <button className="flex items-center gap-3">
              <Avatar user={organization} bordered />
              <span>{currentOrgUsername}</span>
              {organization?.defaultOrgUsername && (
                <span className="text-ds-gray-quaternary font-medium">
                  Current default org
                </span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

Organizations.propTypes = {
  closeModal: PropTypes.func.isRequired,
  updateDefaultOrg: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  organizations: PropTypes.arrayOf(
    PropTypes.shape({
      username: PropTypes.string.isRequired,
    })
  ),
  defaultOrgUsername: PropTypes.string.isRequired,
  setDefaultOrgUsername: PropTypes.func.isRequired,
}

const UpdateDefaultOrgModal = ({ closeModal, updateDefaultOrg, isLoading }) => {
  const { organizations } = useOrganizations()
  const [defaultOrgUsername, setDefaultOrgUsername] = useState('')

  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      hasCloseButton={false}
      title="Select default organization"
      subtitle="Org will appear as default for landing page context"
      body={
        <Organizations
          organizations={organizations}
          defaultOrgUsername={defaultOrgUsername}
          setDefaultOrgUsername={setDefaultOrgUsername}
        />
      }
      footer={
        <div className="flex gap-2">
          <button
            className="text-ds-blue flex-none font-semibold"
            onClick={closeModal}
          >
            Cancel
          </button>
          <div>
            <Button
              isLoading={isLoading}
              hook="update-default-org"
              variant="primary"
              onClick={() => {
                updateDefaultOrg({ username: defaultOrgUsername })
                closeModal()
              }}
              disabled={!defaultOrgUsername}
            >
              Update
            </Button>
          </div>
        </div>
      }
    />
  )
}

UpdateDefaultOrgModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  updateDefaultOrg: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
}

export default UpdateDefaultOrgModal
