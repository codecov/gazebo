import Modal from 'ui/Modal'
import Button from 'ui/Button'
import PropTypes from 'prop-types'
import TextInput from 'old_ui/TextInput'
import { useForm } from 'react-hook-form'
import { useGenerateToken } from 'services/access'
import { useState } from 'react'
import Icon from 'ui/Icon'
import copy from 'copy-to-clipboard'

function CreateTokenModal({ showModal, setShowModal, provider }) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: '',
    },
  })

  const [token, setToken] = useState(null)

  const { mutate } = useGenerateToken({ provider })

  const submit = ({ name }) => {
    if (name !== '') {
      mutate(
        { name },
        {
          onSuccess: ({ data }) => {
            setToken(data.createApiToken.fullToken)
          },
        }
      )
    }
  }

  const renderCreateTokenModal = () => (
    <Modal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      title="Generate new API access token"
      body={
        <div className="flex flex-col">
          <label htmlFor="token-name" className="font-semibold">
            Token Name
          </label>
          <TextInput
            id="token-name"
            name="name"
            placeholder="Name"
            ref={register}
          />
        </div>
      }
      footer={
        <form onSubmit={handleSubmit(submit)} className="flex">
          <Button className="mr-2.5" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            data-testid="generate-token-button"
            type="submit"
            variant="primary"
          >
            Generate Token
          </Button>
        </form>
      }
    />
  )

  const closeModal = () => {
    setShowModal(false)
    setToken(null)
  }

  const renderTokenCreatedModal = () => (
    <Modal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      title="API access token"
      body={
        <div className="flex flex-col">
          <span className="font-semibold mb-4 text-sm">Personal API token</span>
          <div className="flex items-center">
            <span className="font-mono bg-ds-gray-secondary text-ds-gray-octonary ">
              {token}
            </span>
            <div className="flex items-center ml-2 text-ds-blue-darker">
              <Icon className="fill-current" name="clipboard-copy" />
              <span
                onClick={() => copy('3423-0-04543523452435')}
                className="cursor-pointer text-ds-blue-darker text-xs font-semibold"
              >
                copy
              </span>
            </div>
          </div>
          <span className="text-xs mt-4">
            Make sure to copy your token now. you won`t be able to see it again.
          </span>
        </div>
      }
      footer={<Button onClick={closeModal}>Done</Button>}
    />
  )

  return (
    <>
      {!token && renderCreateTokenModal()}
      {token && renderTokenCreatedModal()}
    </>
  )
}

CreateTokenModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  setShowModal: PropTypes.func.isRequired,
  provider: PropTypes.string.isRequired,
}

export default CreateTokenModal
