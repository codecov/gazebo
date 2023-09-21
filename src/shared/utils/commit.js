export const UploadStateEnum = Object.freeze({
  error: 'ERROR',
  uploaded: 'UPLOADED',
  processed: 'PROCESSED',
  complete: 'COMPLETE',
  started: 'STARTED',
})

export const CommitStateEnum = Object.freeze({
  ERROR: 'error',
  SKIPPED: 'skipped',
  COMPLETE: 'complete',
  PENDING: 'pending',
})

export const ErrorCodeEnum = Object.freeze({
  fileNotFoundInStorage: 'FILE_NOT_IN_STORAGE',
  reportExpired: 'REPORT_EXPIRED',
  reportEmpty: 'REPORT_EMPTY',
})

export const UploadTypeEnum = Object.freeze({
  UPLOADED: 'UPLOADED',
  CARRIED_FORWARD: 'CARRIEDFORWARD',
})

export const CommitErrorTypes = Object.freeze({
  MISSING_BASE_COMMIT: 'MissingBaseCommit',
  MISSING_HEAD_COMMIT: 'MissingHeadCommit',
  MISSING_HEAD_REPORT: 'MissingHeadReport',
  MISSING_BASE_REPORT: 'MissingBaseReport',
})
