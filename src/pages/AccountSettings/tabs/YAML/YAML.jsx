import dompurify from 'dompurify'
import noop from 'lodash/noop'
import PropTypes from 'prop-types'
import { Controller, useForm } from 'react-hook-form'

import { useUpdateYaml, useYamlConfig } from 'services/yaml'
import Button from 'ui/Button'

import SuccessModal from './SuccessModal'
import YamlEditor from './YamlEditor'

function YAML({ owner }) {
  const { data: yamlConfig } = useYamlConfig({
    variables: { username: owner },
  })
  const { mutateAsync } = useUpdateYaml({
    username: owner,
  })
  const {
    control,
    handleSubmit,
    formState: {
      isDirty,
      isSubmitSuccessful,
      isSubmitting,
      errors: formErrors,
    },
    setError,
    reset,
  } = useForm({
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
    return mutateAsync({ yaml: dompurify.sanitize(formData.editor) })
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
    <div className="lg:w-3/4">
      <form onSubmit={onSubmit}>
        <SuccessModal
          isOpen={isSubmitSuccessful}
          closeModal={() => reset({}, { keepValues: true })}
          owner={owner}
        />
        <div className="mb-4 border-b border-ds-gray-secondary pb-4">
          <p className="text-lg font-semibold">Global YAML</p>
          <p>
            Changes made to the Global YAML are applied to all repositories in
            the org if they do not have a repo level YAML.{' '}
            <a
              className="text-ds-blue-default hover:underline"
              href="https://docs.codecov.io/docs/codecov-yaml"
              target="_blank"
              rel="noreferrer"
            >
              Learn more
            </a>
          </p>
        </div>
        <div>
          {formErrors.editor && (
            <div className="my-4 rounded border border-ds-primary-red bg-ds-coverage-uncovered p-2 text-ds-primary-red">
              <p>{formErrors.editor.message}</p>
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
          <div className="float-right mt-4">
            <Button
              hook="save-yaml"
              disabled={!isDirty}
              isLoading={isSubmitting}
              variant="primary"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

YAML.propTypes = {
  owner: PropTypes.string,
  provider: PropTypes.string,
}
export default YAML
