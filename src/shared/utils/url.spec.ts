import { getFileExtension, getFilenameFromPath, getFilePathParts } from './url'

describe('getFilesNamesFromFilePath', () => {
  it('returns an array containing files names', () => {
    const path = 'src/ui/shared/services'
    expect(getFilePathParts(path)).toStrictEqual([
      'src',
      'ui',
      'shared',
      'services',
    ])
  })

  it('returns an empty array if path is not present', () => {
    expect(getFilePathParts('')).toStrictEqual([])
  })
})

describe('getFileExtension', () => {
  it('returns the last index of treepaths', () => {
    const fileName = 'file.py'
    expect(getFileExtension(fileName)).toStrictEqual('py')
  })

  it('returns null if fileName is not present', () => {
    expect(getFileExtension('')).toStrictEqual(null)
  })
})

describe('getFilenameFromPath', () => {
  it('returns the last part of the file', () => {
    const path = 'folder/file.py'
    expect(getFilenameFromPath(path)).toStrictEqual('file.py')
  })

  it('returns an null if filename is undefined', () => {
    expect(getFilenameFromPath(undefined)).toStrictEqual(null)
  })
})
