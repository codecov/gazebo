import { transformImpactedFileData } from './transformImpactedFileData'

describe('transformImpactedFileData', () => {
  it('returns file information', () => {
    const data = transformImpactedFileData({
      isNewFile: true,
      headName: 'name',
      isCriticalFile: false,
      segments: [{ segment: true }],
    })

    expect(data).toStrictEqual({
      fileLabel: 'New',
      headName: 'name',
      isCriticalFile: false,
      segments: [{ segment: true }],
    })
  })
})
