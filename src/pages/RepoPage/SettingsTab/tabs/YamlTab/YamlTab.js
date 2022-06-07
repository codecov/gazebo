import { useRepoSettings } from 'services/repo'

import YAML from './YAML'

function YamlTab() {
  const { data } = useRepoSettings()
  const repository = data?.repository

  return <YAML yaml={repository?.yaml} />
}

export default YamlTab
