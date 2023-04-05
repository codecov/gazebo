import { useRepoSettings } from 'services/repo'

import DangerZone from './DangerZone'
import DefaultBranch from './DefaultBranch'
import Tokens from './Tokens'

function GeneralTab() {
  const { data } = useRepoSettings()
  const repository = data?.repository

  return (
    <div className="flex flex-col gap-6">
      {repository?.defaultBranch && (
        <DefaultBranch defaultBranch={repository?.defaultBranch} />
      )}
      <Tokens />
      <DangerZone />
    </div>
  )
}

export default GeneralTab
