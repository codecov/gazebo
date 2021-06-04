import { useState } from 'react'
import PropTypes from 'prop-types'
import { sanitize } from 'dompurify'

import YamlEditor from './YamlEditor'
import Button from 'ui/Button'
import { useYamlConfig, useUpdateYaml } from 'services/yaml'

function YAML({ owner }) {
  const [isDirty, setDirty] = useState(false)
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
    mutate({ yaml: sanitize(newConfig) })
  }

  return (
    <>
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
      />
      <div className="mt-4 float-right">
        <Button
          variant="primary"
          disabled={!isDirty}
          onClick={onSubmit}
          isLoading={isLoading}
        >
          Save Changes
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
