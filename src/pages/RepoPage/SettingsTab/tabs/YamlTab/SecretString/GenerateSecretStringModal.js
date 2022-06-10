import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'

import Button from 'ui/Button'
import Modal from 'ui/Modal'
import TextInput from 'ui/TextInput'

const GenerateSecretStringModal = ({
  closeModal,
  generateSecretString,
  isLoading,
  showCopyModal,
}) => {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      value: '',
    },
  })

  const value = watch('string', '')
  const submit = async () => {
    await generateSecretString({ value })
    await closeModal()
    showCopyModal()
  }

  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      title="Create Secret String"
      body={
        <div className="flex flex-col gap-4">
          <p>Please type the information you would like encrypted:</p>
          <TextInput
            value={value}
            {...register('string', { required: true })}
            placeholder="Secret String"
            autoFocus
          />
          <hr />
          <p>
            Please use the <span className="font-semibold">entire string</span>.
            Encrypted strings{' '}
            <span className="font-semibold">
              will not work for other repositories
            </span>
            , they are unique to each repository.
          </p>
          <div className="flex flex-col gap-1">
            <h3 className="text-ds-primary-green">Correct</h3>
            <p>
              <span className="font-semibold">In: </span>
              https://hooks.slack.com/ugh204uhg2
            </p>
            <p>
              <span className="font-semibold">Out: </span>{' '}
              secret:Z8vIvkPwoUo1r...
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-ds-primary-red">Incorrect</h3>
            <p>
              <span className="font-semibold">In: </span>
              https://hipchat.com/rooms?token={' '}
              <span className="font-semibold">ugh204uhg2</span>
            </p>
            <p>
              <span className="font-semibold">Out: </span>
              https://hipchat.com/rooms?token={' '}
              <span className="font-semibold">secret:Z8vIvkPwoUo1r...</span>
            </p>
          </div>
        </div>
      }
      footer={
        <form onSubmit={handleSubmit(submit)}>
          <Button
            type="submit"
            isLoading={isLoading}
            hook="generate-secret-string"
            variant="primary"
            disabled={value.length === 0}
          >
            Generate
          </Button>
        </form>
      }
    />
  )
}

GenerateSecretStringModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  generateSecretString: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  showCopyModal: PropTypes.func.isRequired,
}

export default GenerateSecretStringModal
