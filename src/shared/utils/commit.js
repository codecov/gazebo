export const UploadStateEnum = Object.freeze({
  error: 'ERROR',
  uploaded: 'UPLOADED',
  processed: 'PROCESSED',
  complete: 'COMPLETE',
  pending: 'PENDING',
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
