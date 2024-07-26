import PropTypes from 'prop-types'

import YamlEditor from 'pages/AccountSettings/tabs/YAML/YamlEditor'

function YAML({ yaml }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="mx-4 flex flex-col gap-2 sm:mx-0">
        <h1 className="text-lg font-semibold">Repository YAML</h1>
        <p>
          This is the default YAML for the current repository, after validation.
          This YAML takes precedence over the global YAML, but will be
          overwritten if a YAML change is included in a commit.
        </p>
      </div>
      <hr />
      <YamlEditor
        className="useReadOnlyCursor"
        value={yaml}
        readOnly
        placeholder="Repo YAML Configuration"
      />
    </div>
  )
}

YAML.propTypes = {
  yaml: PropTypes.string,
}

export default YAML
