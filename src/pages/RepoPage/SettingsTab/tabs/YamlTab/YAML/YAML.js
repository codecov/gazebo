import { useParams } from 'react-router-dom'

import YamlEditor from 'pages/AccountSettings/tabs/YAML/YamlEditor'
import { useRepo } from 'services/repo'

function YAML() {
  const { provider, owner, repo } = useParams()
  const { data } = useRepo({ provider, owner, repo })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 xl:w-3/4">
        <h1 className="text-lg font-semibold">Repository yaml</h1>
        <p>
          This is the default yaml for the current repository, after validation.
          This yaml takes precedence over the global yaml, but will be
          overwritten if a yaml change is included in a commit.
        </p>
      </div>
      <hr />
      <YamlEditor
        value={data?.repository?.yaml}
        readOnly
        placeholder="Repo Yaml Configuration"
      />
    </div>
  )
}

export default YAML
