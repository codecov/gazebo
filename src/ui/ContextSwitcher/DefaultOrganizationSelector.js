import noop from 'lodash/noop'
import PropTypes from 'prop-types'
import { useState } from 'react'
import ReactModal from 'react-modal'

import OrganizationsList from './OrganizationsList'

import Button from '../Button'
import BaseModal from '../Modal/BaseModal'

function DefaultOrganizationSelector({ onClose }) {
  const [selectedOrg, setSelectedOrg] = useState()

  const handleDefaultOrgUpdate = () => {
    localStorage.setItem('gz-defaultOrganization', JSON.stringify(selectedOrg))
    onClose()
  }

  const modalProps = {
    title: 'Select default organization',
    subtitle: 'Org will appear as default for landing page context',
    body: <OrganizationsList onSelect={(org) => setSelectedOrg(org)} />,
    footer: (
      <div className="flex justify-between gap-4">
        <Button variant="link" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={!Boolean(selectedOrg)}
          onClick={handleDefaultOrgUpdate}
        >
          Update
        </Button>
      </div>
    ),
  }
  return (
    <ReactModal
      isOpen
      onRequestClose={noop}
      className="h-screen w-screen flex items-center justify-center"
      overlayClassName="fixed inset-0 bg-ds-gray-octonary/70 z-10"
    >
      <BaseModal hasCloseButton={false} onClose={noop} {...modalProps} />
    </ReactModal>
  )
}

DefaultOrganizationSelector.propTypes = {
  onClose: PropTypes.func.isRequired,
}

export default DefaultOrganizationSelector
