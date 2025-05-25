import PropTypes from 'prop-types'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useGenerateUserToken } from 'services/access/useGenerateUserToken'
import Button from 'ui/Button'
import { CopyClipboard } from 'ui/CopyClipboard'
import Modal from 'ui/Modal'
import TextInput from 'ui/TextInput/TextInput'

function CreateTokenModal({ closeModal, provider }) {
  const [token, setToken] = useState(null)
  const { register, handleSubmit, watch } = useForm({
    defaultValues: { name: '' },
  })
  const nameValue = watch('name', '')
  const { mutate, isLoading } = useGenerateUserToken({ provider })

  const submit = ({ name }) => {
    mutate(
      { name },
      {
        onSuccess: (data) => {
          setToken(data?.createUserToken?.fullToken)
        },
      }
    )
  }

  const renderCreateTokenModal = () => (
    <Modal
      isOpen={true}
      onClose={closeModal}
      title="Generate new API access token"
      body={
        <TextInput
          dataMarketing="access-token-name"
          label="Token Name"
          aria-label="token name"
          name="name"
          placeholder="Name"
          {...register('name', { required: true })}
        />
      }
      footer={
        <form onSubmit={handleSubmit(submit)} className="flex">
          <div className="mr-2.5">
            <Button hook="close-modal" onClick={closeModal}>
              Cancel
            </Button>
          </div>
          <Button
            hook="generate-token"
            isLoading={isLoading}
            type="submit"
            variant="primary"
            disabled={nameValue?.length === 0}
          >
            Generate Token
          </Button>
        </form>
      }
    />
  )

  const renderTokenCreatedModal = () => (
    <Modal
      isOpen={true}
      onClose={closeModal}
      title="API access token"
      body={
        <div className="flex flex-col">
          <span className="mb-4 text-sm font-semibold">Personal API token</span>
          <div className="flex items-center gap-2">
            <span className="mr-2 bg-ds-gray-secondary font-mono text-ds-gray-octonary">
              {token}
            </span>
            <CopyClipboard value={token} data-testid="clipboard-copy-token" />
          </div>
          <span className="mt-4 text-xs">
            Make sure to copy your token now. you won`t be able to see it again.
          </span>
        </div>
      }
      footer={
        <Button hook="close-modal" onClick={closeModal}>
          Done
        </Button>
      }
    />
  )

  return <>{token ? renderTokenCreatedModal() : renderCreateTokenModal()}</>
}

CreateTokenModal.propTypes = {
  provider: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
}

export default CreateTokenModal
