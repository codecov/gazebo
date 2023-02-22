import PropTypes from 'prop-types'
import { useState } from 'react'

import { useUpdateDefaultOrganization } from 'services/defaultOrganization'
import Button from 'ui/Button'
import Modal from 'ui/Modal'

import OrganizationList from './OrganizationList'

const UpdateDefaultOrgModal = ({ closeModal }) => {
  const [selectedOrgUsername, setSelectedOrgUsername] = useState('')
  const { mutate } = useUpdateDefaultOrganization()

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
            className="flex-none font-semibold text-ds-blue"
            onClick={() => {
              closeModal()
            }}
          >
            Cancel
          </button>
          <div>
            <Button
              hook="update-default-org"
              variant="primary"
              onClick={() => {
                mutate({ username: selectedOrgUsername })
                closeModal()
              }}
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
