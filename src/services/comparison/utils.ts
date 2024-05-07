import isEmpty from 'lodash/isEmpty'
import { z } from 'zod'

import { ImpactedFileSchema } from './useComparisonForCommitAndParent'

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

export function transformImpactedFileData(
  impactedFile: z.infer<typeof ImpactedFileSchema>
) {
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
    segments: impactedFile?.segments?.results,
    ...(!!hashedPath && { hashedPath }),
  }
}
