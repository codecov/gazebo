import { transformImpactedFileToDiff } from './transformImpactedFileToDiff'

describe('transformImpactedFileToDiff', () => {
  it('returns file information', () => {
    const data = transformImpactedFileToDiff({
      isNewFile: true,
      headName: 'name',
      isCriticalFile: false,
      segments: { results: [{ segment: true }] },
    })

    expect(data).toStrictEqual({
      fileLabel: 'New',
      headName: 'name',
      isCriticalFile: false,
      segments: [{ segment: true }],
    })
  })
})
