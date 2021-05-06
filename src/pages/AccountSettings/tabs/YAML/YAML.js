import PropTypes from 'prop-types'
import YamlEditor from './YamlEditor'
import Button from 'ui/Button'

function YAML({ owner, provider }) {
  const value = ``
  const onChange = (value) => {
    // dispatch to yaml endpoint
    console.log(value)
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
          >
            learn more
          </a>
        </p>
      </div>
      <YamlEditor
        placeholder={`All ${owner} repos will inherit this configuration`}
        value={value}
        onChange={onChange}
      />
      <div className="mt-4 float-right">
        <Button variant="primary" disabled={false}>
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
