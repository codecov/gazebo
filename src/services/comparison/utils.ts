import isEmpty from 'lodash/isEmpty'

import { ImpactedFileType } from './useComparisonForCommitAndParent'

function _setFileLabel({
  isNewFile,
  isRenamedFile,
  isDeletedFile,
}: {
  isNewFile: boolean
  isRenamedFile: boolean
  isDeletedFile: boolean
}): string | null {
  if (isNewFile) return 'New'
  if (isRenamedFile) return 'Renamed'
  if (isDeletedFile) return 'Deleted'
  return null
}

export function transformImpactedFileToDiff(impactedFile: ImpactedFileType) {
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
    segments: impactedFile?.segments,
    ...(!!hashedPath && { hashedPath }),
  }
}
