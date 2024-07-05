import PropTypes from 'prop-types'
import { useState } from 'react'

import { useEraseRepoContent } from 'services/repo'
import Button from 'ui/Button'

import EraseRepoContentModal from './EraseRepoContentModal'

function EraseRepoButton({ isLoading, setShowModal }) {
  if (isLoading) {
    return (
      <div className="font-light italic">
        processing erase, this may take a while
      </div>
    )
  }

  return (
    <Button
      variant="danger"
      hook="show-modal"
      onClick={() => setShowModal(true)}
    >
      Erase Content
    </Button>
  )
}

EraseRepoButton.propTypes = {
  setShowModal: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
}

function EraseRepoContent() {
  const [showModal, setShowModal] = useState(false)
  const { mutate: eraseRepoContent, isLoading } = useEraseRepoContent()

  return (
    <div className="flex flex-col sm:flex-row">
      <div className="flex flex-1 flex-col gap-1">
        <h2 className="font-semibold">Erase repo coverage content</h2>
        <p className="max-w-md">
          This will remove all coverage reporting from the repo. For larger
          repositories, this process may not be able to complete automatically.
          In that case, please reach out to support for help.
        </p>
      </div>
      <div>
        <EraseRepoButton isLoading={isLoading} setShowModal={setShowModal} />
        <EraseRepoContentModal
          showModal={showModal}
          closeModal={() => setShowModal(false)}
          eraseRepoContent={eraseRepoContent}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default EraseRepoContent
