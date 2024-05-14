import {
  forwardMarketingTag,
  getFileExtension,
  getFilenameFromPath,
  getFilePathParts,
} from './url'

describe('forwardMarketingTag', () => {
  it('returns an object containing the specified utm parameters only', () => {
    const queryParams =
      '?utm_medium=social%20media&utm_source=twitter&utm_campaign=organic_social&utm_department=marketing'
    expect(forwardMarketingTag(queryParams)).toStrictEqual({
      utm_campaign: 'organic_social',
      utm_department: 'marketing',
      utm_medium: 'social media',
      utm_source: 'twitter',
    })
  })

  it('returns an empty object if no utm parameters are present in a query string', () => {
    const queryParams =
      '?ashton=barbarian&laudna=warlock&FCG=cleric&chetney=rogue&orym=fighter&fearne=druid&dorian=bard&imogen=sorcerer'
    expect(forwardMarketingTag(queryParams)).toStrictEqual({})
  })
})

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

  it('returns an null if fileName is not present', () => {
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
