import isEmpty from 'lodash/isEmpty'
import { type z } from 'zod'

import { ComparisonSchema } from '../fragments'

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

export function transformImpactedPullFileToDiff(
  impactedFile: z.infer<typeof ComparisonSchema>['impactedFile']
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
    segments: impactedFile?.segments,
    ...(!!hashedPath && { hashedPath }),
  }
}
