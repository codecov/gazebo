interface SetFileLabel {
  isNewFile?: boolean
  isRenamedFile?: boolean
  isDeletedFile?: boolean
}

export function setFileLabel({
  isNewFile,
  isRenamedFile,
  isDeletedFile,
}: SetFileLabel) {
  if (isNewFile) return 'New'
  if (isRenamedFile) return 'Renamed'
  if (isDeletedFile) return 'Deleted'
  return null
}
