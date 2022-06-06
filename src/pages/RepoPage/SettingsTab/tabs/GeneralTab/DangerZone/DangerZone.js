import SettingsDescriptor from 'ui/SettingsDescriptor'

import DeactivateRepo from './DeactivateRepo'
import EraseRepoContent from './EraseRepoContent'

function DanerZone() {
  return (
    <SettingsDescriptor
      title="Danger Zone"
      description="Erase repo coverage data and pause upload ability"
      content={
        <>
          <EraseRepoContent />
          <DeactivateRepo />
        </>
      }
    />
  )
}

export default DanerZone
