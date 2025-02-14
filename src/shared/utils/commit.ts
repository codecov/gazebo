export const UploadStateEnum = {
  uploaded: 'UPLOADED',
  started: 'STARTED',
  complete: 'COMPLETE',
  error: 'ERROR',
  processed: 'PROCESSED',
} as const

export const UploadErrorStates = Object.values(UploadStateEnum)

export const CommitStateEnum = {
  ERROR: 'error',
  SKIPPED: 'skipped',
  COMPLETE: 'complete',
  PENDING: 'pending',
} as const

export const ErrorCodeEnum = {
  fileNotFoundInStorage: 'FILE_NOT_IN_STORAGE',
  reportExpired: 'REPORT_EXPIRED',
  reportEmpty: 'REPORT_EMPTY',
  processingTimeout: 'PROCESSING_TIMEOUT',
  unsupportedFileFormat: 'UNSUPPORTED_FILE_FORMAT',

  unknownProcessing: 'UNKNOWN_PROCESSING',
  unknownStorage: 'UNKNOWN_STORAGE',
} as const

export const UploadTypeEnum = {
  UPLOADED: 'UPLOADED',
  CARRIED_FORWARD: 'CARRIEDFORWARD',
} as const

export const CommitErrorTypes = {
  MISSING_BASE_COMMIT: 'MissingBaseCommit',
  MISSING_HEAD_COMMIT: 'MissingHeadCommit',
  MISSING_HEAD_REPORT: 'MissingHeadReport',
  MISSING_BASE_REPORT: 'MissingBaseReport',
} as const
