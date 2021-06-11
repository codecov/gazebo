import { useState } from 'react'
import PropTypes from 'prop-types'
import { sanitize } from 'dompurify'

import { useYamlConfig, useUpdateYaml } from 'services/yaml'
import Button from 'ui/Button'

import YamlEditor from './YamlEditor'
import SuccessModal from './SuccessModal'

const DEFAULT_BUTTON = { type: 'primary', text: 'Save Changes' }

function YAML({ owner }) {
  const [isDirty, setDirty] = useState(false)
  const [modal, openModal] = useState(false)
  const [annotations, setAnnotations] = useState([])
  const [button, setButton] = useState(DEFAULT_BUTTON)

  const { data: yamlConfig, isSuccess } = useYamlConfig({
    variables: { username: owner },
  })
  const [newConfig, setNewConfig] = useState(yamlConfig)
  const { isLoading, mutate } = useUpdateYaml({
    username: owner,
  })

  const onChange = (value) => {
    setDirty(true)
    setNewConfig(value)
  }

  const onSubmit = () => {
    mutate(
      { yaml: sanitize(newConfig) },
      {
        onSuccess: ({ errors, ...args }) => {
          if (!errors) {
            openModal(true)
            setButton(DEFAULT_BUTTON)
            setAnnotations([])
            return
          }
          setButton({ type: 'danger', text: 'Unsaved changes' })
          setAnnotations(
            errors.map((err) => ({
              row: err.locations[0].line - 1,
              column: err.locations[0].column - 1,
              text: err.message,
              type: 'error',
            }))
          )
        },
      }
    )
  }

  return (
    <>
      <SuccessModal
        isOpen={modal}
        closeModal={() => openModal(false)}
        owner={owner}
      />
      <div className="border-b border-ds-gray-secondary pb-4 mb-4">
        <p className="font-bold text-lg">Global yml</p>
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
      <YamlEditor
        placeholder={`All ${owner} repos will inherit this configuration`}
        value={isSuccess && newConfig}
        onChange={onChange}
        annotations={annotations}
      />
      <div className="mt-4 float-right">
        <Button
          variant={button.type}
          disabled={!isDirty}
          onClick={onSubmit}
          isLoading={isLoading}
        >
          {button.text}
        </Button>
      </div>
    </>
  )
}

YAML.propTypes = {
  owner: PropTypes.string,
  provider: PropTypes.string,
}
export default YAML
