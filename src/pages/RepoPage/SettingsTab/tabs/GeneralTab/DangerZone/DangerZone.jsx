import SettingsDescriptor from 'ui/SettingsDescriptor'

import EraseRepoContent from './EraseRepoContent'
import RepoState from './RepoState'

function DangerZone() {
  return (
    <SettingsDescriptor
      title="Danger Zone"
      description="Erase repo coverage data and pause upload ability"
      content={
        <>
          <EraseRepoContent />
          <RepoState />
        </>
      }
    />
  )
}

export default DangerZone
