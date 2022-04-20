import { sanitize } from 'dompurify'
import noop from 'lodash/noop'
import PropTypes from 'prop-types'
import { Controller, useForm } from 'react-hook-form'

import { useIsCurrentUserAnAdmin } from 'services/user'
import { useUpdateYaml, useYamlConfig } from 'services/yaml'
import Button from 'ui/Button'

import SuccessModal from './SuccessModal'
import YamlEditor from './YamlEditor'

function YAML({ owner }) {
  const isAdmin = useIsCurrentUserAnAdmin({ owner })
  const { data: yamlConfig } = useYamlConfig({
    variables: { username: owner },
  })
  const { mutateAsync } = useUpdateYaml({
    username: owner,
  })
  const { control, handleSubmit, formState, setError, reset } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: { editor: yamlConfig },
    criteriaMode: 'firstError',
  })

  const formError = (message) => {
    setError('editor', {
      type: 'manual',
      message,
    })
    throw message
  }

  const onSubmit = handleSubmit((formData) => {
    return mutateAsync({ yaml: sanitize(formData.editor) })
      .then(({ data, errors }) => {
        if (data?.setYamlOnOwner?.error) {
          formError(data?.setYamlOnOwner?.error.message)
        } else if (errors) {
          formError('Something went wrong')
        }
      })
      .catch(noop)
  })

  return (
    <form onSubmit={onSubmit}>
      <SuccessModal
        isOpen={formState.isSubmitSuccessful}
        closeModal={() => reset({}, { keepValues: true })}
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
      {formState.errors.editor && (
        <div className="p-2 my-4 text-ds-primary-red border-ds-primary-red border rounded bg-ds-coverage-uncovered">
          <p>{formState.errors.editor.message}</p>
        </div>
      )}
      <Controller
        control={control}
        name="editor"
        render={({ field: { onChange, value } }) => (
          <YamlEditor
            readOnly={!isAdmin}
            value={value}
            onChange={onChange}
            placeholder={`All ${owner} repos will inherit this configuration`}
          />
        )}
      />
      <div className="mt-4 float-right">
        {isAdmin && (
          <Button
            hook="save-yaml"
            disabled={!formState.isDirty}
            isLoading={formState.isSubmitting}
            variant="primary"
          >
            Save Changes
          </Button>
        )}
      </div>
    </form>
  )
}

YAML.propTypes = {
  owner: PropTypes.string,
  provider: PropTypes.string,
}
export default YAML
