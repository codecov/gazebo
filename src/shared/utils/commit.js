export const UploadStateEnum = Object.freeze({
  error: 'ERROR',
  uploaded: 'UPLOADED',
  processed: 'PROCESSED',
})

export const ErrorCodeEnum = Object.freeze({
  fileNotFoundInStorage: 'FILE_NOT_IN_STORAGE',
  reportExpired: 'REPORT_EXPIRED',
  reportEmpty: 'REPORT_EMPTY',
})

export const UploadTypes = Object.freeze({
  UPLOADED: 'UPLOADED',
  CARRIED_FORWARD: 'CARRIEDFORWARD',
})

export const TruncateEnum = Object.freeze({
  EXPAND: 'see more...',
  COLLAPSE: 'see less...',
})
