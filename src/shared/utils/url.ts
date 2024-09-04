export const formatPathPrefix = (pathname: string) =>
  pathname.charAt(pathname.length - 1) === '/'
    ? pathname.slice(0, pathname.length - 1)
    : pathname

export function getFilenameFromFilePath(path: string) {
  return path.split('/').pop() ?? ''
}

export function getFilePathParts(path: string) {
  if (!path || path === '') {
    return []
  }
  return path.split('/') ?? []
}

export function getFilenameFromPath(path?: string) {
  if (typeof path !== 'string') {
    return null
  }
  return path?.split('/').at(-1)
}

export function getFileExtension(fileName: string) {
  if (!fileName.includes('.')) {
    return null
  }
  return fileName.split('.').at(-1)?.toLowerCase()
}
