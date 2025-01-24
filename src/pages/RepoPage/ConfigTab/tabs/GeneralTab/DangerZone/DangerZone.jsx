import SettingsDescriptor from 'ui/SettingsDescriptor'

import EraseRepo from './EraseRepo'
import RepoState from './RepoState'

function DangerZone() {
  return (
    <SettingsDescriptor
      title="Danger Zone"
      description="Erase repository or pause upload ability"
      content={
        <>
          <EraseRepo />
          <RepoState />
        </>
      }
    />
  )
}

export default DangerZone
