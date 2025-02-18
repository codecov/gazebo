import { transformImpactedPullFileToDiff } from './transformImpactedPullFileToDiff'

describe('transformImpactedPullFileToDiff', () => {
  it('returns file information', () => {
    const data = transformImpactedPullFileToDiff({
      hashedPath: 'hashedPath',
      headName: 'headName',
      isRenamedFile: false,
      isNewFile: false,
      isDeletedFile: false,

      baseCoverage: {
        percentCovered: 23,
      },
      headCoverage: {
        percentCovered: 24,
      },
      patchCoverage: {
        percentCovered: 25,
      },
      changeCoverage: 0,
      segments: {
        results: [
          {
            header: 'header',
            hasUnintendedChanges: false,
            lines: [
              {
                baseNumber: '1',
                headNumber: '1',
                baseCoverage: 'M',
                headCoverage: 'H',
                content: 'content',
              },
            ],
          },
        ],
      },
    })

    expect(data).toStrictEqual({
      fileLabel: null,
      hashedPath: 'hashedPath',
      headName: 'headName',

      segments: [
        {
          hasUnintendedChanges: false,
          header: 'header',
          lines: [
            {
              baseCoverage: 'M',
              baseNumber: '1',
              content: 'content',
              headCoverage: 'H',
              headNumber: '1',
            },
          ],
        },
      ],
    })
  })
})
