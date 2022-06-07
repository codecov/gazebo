import CurrentRepoSettings from './CurrentRepoSettings'
import ValidateYaml from './ValidateYaml'
import YAML from './YAML'

function YamlTab() {
  return (
    <div className="flex flex-col gap-8">
      <YAML />
      <div className="flex flex-col gap-4 xl:w-3/5 border-2 border-ds-gray-primary p-4">
        <CurrentRepoSettings />
        <hr />
        <ValidateYaml />
      </div>
    </div>
  )
}

export default YamlTab
