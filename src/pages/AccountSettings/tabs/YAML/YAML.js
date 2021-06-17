import { useState } from 'react'
import PropTypes from 'prop-types'
import { sanitize } from 'dompurify'
import { useForm, Controller } from 'react-hook-form'

import { useYamlConfig, useUpdateYaml } from 'services/yaml'
import Button from 'ui/Button'

import YamlEditor from './YamlEditor'
import SuccessModal from './SuccessModal'

const DEFAULT_BUTTON = { type: 'primary', text: 'Save Changes' }

function YAML({ owner }) {
  const [modal, openModal] = useState(false)
  const [error, setErrorMessage] = useState('')
  const [button, setButton] = useState(DEFAULT_BUTTON)

  const { data: yamlConfig } = useYamlConfig({
    variables: { username: owner },
  })
  const { isLoading, mutate } = useUpdateYaml({
    username: owner,
  })
  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { editor: yamlConfig },
    criteriaMode: 'firstError',
  })

  const onSubmitHandler = (formData) => {
    mutate(
      { yaml: sanitize(formData.editor) },
      {
        onSuccess: ({ data, errors }) => {
          if (
            data?.setYamlOnOwner?.owner?.yaml ||
            data?.setYamlOnOwner?.owner?.yaml === ''
          ) {
            openModal(true)
            setButton(DEFAULT_BUTTON)
            setErrorMessage('')
            return
          }
          if (data?.setYamlOnOwner?.error) {
            setErrorMessage(data.setYamlOnOwner.error)
          } else if (errors) {
            setErrorMessage('Something went wrong.')
          }
          setButton({ type: 'danger', text: 'Unsaved changes' })
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)}>
      <SuccessModal
        isOpen={modal}
        closeModal={() => openModal(false)}
        owner={owner}
      />
      <div className="border-b border-ds-gray-secondary pb-4 mb-4">
        <p className="font-semimbold text-lg">Global yml</p>
        <p>
          Changes made to the Global yml will override the default repo settings
          and is applied to all repositories in the org.{' '}
          <a
            className="text-ds-blue hover:underline"
            href="https://docs.codecov.io/docs/codecov-yaml"
            target="_blank"
            rel="noreferrer"
          >
            learn more
          </a>
        </p>
      </div>
      {error && (
        <div className="p-2 my-4 text-ds-primary-red border-ds-primary-red border rounded bg-ds-coverage-uncovered">
          <p>{error}</p>
        </div>
      )}
      <Controller
        control={control}
        name="editor"
        render={({ field: { onChange, value } }) => (
          <YamlEditor
            value={value}
            onChange={onChange}
            placeholder={`All ${owner} repos will inherit this configuration`}
          />
        )}
      />
      <div className="mt-4 float-right">
        <Button variant={button.type} disabled={!isDirty} isLoading={isLoading}>
          {button.text}
        </Button>
      </div>
    </form>
  )
}

YAML.propTypes = {
  owner: PropTypes.string,
  provider: PropTypes.string,
}
export default YAML
