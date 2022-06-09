import PropTypes from 'prop-types'

import YamlEditor from 'pages/AccountSettings/tabs/YAML/YamlEditor'

function YAML({ yaml }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 xl:w-3/4">
          <h1 className="text-lg font-semibold">Repository yaml</h1>
          <p>
            This is the default yaml for the current repository, after
            validation. This yaml takes precedence over the global yaml, but
            will be overwritten if a yaml change is included in a commit.
          </p>
        </div>
        <hr />
      </div>
      <YamlEditor value={yaml} readOnly placeholder="Repo Yaml Configuration" />
    </div>
  )
}

YAML.propTypes = {
  yaml: PropTypes.string,
}

export default YAML
