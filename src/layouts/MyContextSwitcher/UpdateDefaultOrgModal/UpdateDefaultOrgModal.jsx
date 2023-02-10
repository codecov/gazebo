import PropTypes from 'prop-types'
import { useState } from 'react'

import Button from 'ui/Button'
import Modal from 'ui/Modal'

import { useUpdateDefaultOrg } from './hooks'
import OrganizationList from './OrganizationList'

const UpdateDefaultOrgModal = ({ closeModal }) => {
  const { updateDefaultOrg } = useUpdateDefaultOrg()
  const [selectedOrgUsername, setSelectedOrgUsername] = useState('')

  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      hasCloseButton={false}
      size="small"
      title="Select default organization"
      subtitle="Org will appear as default for landing page context"
      body={
        <OrganizationList
          selectedOrgUsername={selectedOrgUsername}
          setSelectedOrgUsername={setSelectedOrgUsername}
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
              hook="update-default-org"
              variant="primary"
              onClick={() => {
                updateDefaultOrg({ username: selectedOrgUsername })
                closeModal()
              }}
              disabled={!selectedOrgUsername}
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
}

export default UpdateDefaultOrgModal
