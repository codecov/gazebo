import isEmpty from 'lodash/isEmpty'

function _setFileLabel({ isNewFile, isRenamedFile, isDeletedFile }) {
  if (isNewFile) return 'New'
  if (isRenamedFile) return 'Renamed'
  if (isDeletedFile) return 'Deleted'
  return null
}

export function transformImpactedFileData(impactedFile) {
  if (isEmpty(impactedFile)) {
    return null
  }

  const fileLabel = _setFileLabel({
    isNewFile: impactedFile?.isNewFile,
    isRenamedFile: impactedFile?.isRenamedFile,
    isDeletedFile: impactedFile?.isDeletedFile,
  })
  const hashedPath = impactedFile?.hashedPath

  return {
    fileLabel,
    headName: impactedFile?.headName,
    isCriticalFile: impactedFile?.isCriticalFile,
    segments: impactedFile?.segmentsDeprecated,
    ...(hashedPath && { hashedPath }),
  }
}
