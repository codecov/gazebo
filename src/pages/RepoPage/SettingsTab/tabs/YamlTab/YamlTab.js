import { useRepoSettings } from 'services/repo'

import CurrentRepoSettings from './CurrentRepoSettings'
import YAML from './YAML'

function YamlTab() {
  const { data } = useRepoSettings()
  const repository = data?.repository

  return (
    <div className="flex flex-col gap-8">
      <YAML yaml={repository?.yaml} />
      <div className="flex flex-col gap-4 xl:w-3/5 border-2 border-ds-gray-primary p-4">
        <CurrentRepoSettings
          botUsername={repository?.bot?.username}
          defaultBranch={repository?.defaultBranch}
        />
        <hr />
      </div>
    </div>
  )
}

export default YamlTab
