import { UploadTypeEnum } from './commit'
import { extractUploads } from './extractUploads'

const travisObject = {
  state: 'STARTED',
  provider: 'travis',
  createdAt: '2020-08-25T16:36:25.820340+00:00',
  updatedAt: '2020-08-25T16:36:25.859889+00:00',
  flags: [],
  downloadUrl:
    '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/18b19f8d-5df6-48bd-90eb-50578ed8812f.txt',
  ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065763',
  uploadType: 'uploaded',
  errors: [],
}
const circleciObject = {
  state: 'ERROR',
  provider: 'circleci',
  createdAt: '2020-08-25T16:36:19.559474+00:00',
  updatedAt: '2020-08-25T16:36:19.679868+00:00',
  flags: [],
  downloadUrl:
    '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
  ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065746',
  uploadType: 'uploaded',
  errors: [],
}

const mockUploads = [travisObject, circleciObject]

describe('extractUploads', () => {
  describe('uploads', () => {
    it('returns sortedUploads', () => {
      const { sortedUploads } = extractUploads({
        unfilteredUploads: mockUploads,
      })

      expect(sortedUploads).toStrictEqual({
        travis: [travisObject],
        circleci: [circleciObject],
      })
    })

    it('returns upload providers', () => {
      const { uploadsProviderList } = extractUploads({
        unfilteredUploads: mockUploads,
      })

      expect(uploadsProviderList).toStrictEqual(['travis', 'circleci'])
    })

    it('returns overview summary', () => {
      const { uploadsOverview } = extractUploads({
        unfilteredUploads: mockUploads,
      })

      expect(uploadsOverview).toEqual('1 started, 1 errored')
    })

    it('returns hasNoUploads', () => {
      const { hasNoUploads } = extractUploads({
        unfilteredUploads: mockUploads,
      })

      expect(hasNoUploads).toEqual(false)
    })

    it('returns erroredUploads', () => {
      const { erroredUploads } = extractUploads({
        unfilteredUploads: mockUploads,
      })

      expect(erroredUploads).toStrictEqual({
        circleci: [circleciObject],
      })
    })
  })

  it('returns non-duplicate cff and regular uploads', () => {
    const uploads = [
      {
        state: 'COMPLETE',
        provider: 'circleci',
        createdAt: '2020-08-25T16:36:19.559474+00:00',
        updatedAt: '2020-08-25T16:36:19.679868+00:00',
        flags: ['test-one'],
        name: 'upload - 1',
        downloadUrl:
          '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/7826783-de37-4272-ad50-c4dc805802fb.txt',
        ciUrl: 'https://circleci.com/febg/repo-test/jobs/721065746',
        uploadType: UploadTypeEnum.CARRIED_FORWARD,
        errors: [],
      },
      {
        state: 'COMPLETE',
        provider: 'circleci',
        createdAt: '2020-08-25T16:36:19.559474+00:00',
        updatedAt: '2020-08-25T16:36:19.679868+00:00',
        flags: ['test-one'],
        name: 'upload - 2',
        downloadUrl:
          '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
        ciUrl: 'https://circleci.com/febg/repo-test/jobs/721065746',
        uploadType: UploadTypeEnum.CARRIED_FORWARD,
        errors: [],
      },
      {
        state: 'COMPLETE',
        provider: 'circleci',
        createdAt: '2020-08-25T16:36:19.559474+00:00',
        updatedAt: '2020-08-25T16:36:19.679868+00:00',
        flags: ['test-two'],
        name: 'test - 3',
        downloadUrl:
          '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
        ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065746',
        uploadType: UploadTypeEnum.CARRIED_FORWARD,
        errors: [],
      },
      {
        state: 'PROCESSED',
        provider: 'circleci',
        createdAt: '2020-08-25T16:36:19.559474+00:00',
        updatedAt: '2020-08-25T16:36:19.679868+00:00',
        flags: ['test-one'],
        name: 'upload - 1',
        downloadUrl:
          '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
        ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065746',
        uploadType: UploadTypeEnum.UPLOADED,
        errors: [],
      },
    ]

    const { sortedUploads } = extractUploads({ unfilteredUploads: uploads })
    expect(sortedUploads).toStrictEqual({
      circleci: [
        {
          state: 'COMPLETE',
          provider: 'circleci',
          createdAt: '2020-08-25T16:36:19.559474+00:00',
          updatedAt: '2020-08-25T16:36:19.679868+00:00',
          flags: ['test-two'],
          name: 'test - 3',
          downloadUrl:
            '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
          ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065746',
          uploadType: UploadTypeEnum.CARRIED_FORWARD,
          errors: [],
        },
        {
          state: 'PROCESSED',
          provider: 'circleci',
          createdAt: '2020-08-25T16:36:19.559474+00:00',
          updatedAt: '2020-08-25T16:36:19.679868+00:00',
          flags: ['test-one'],
          name: 'upload - 1',
          downloadUrl:
            '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
          ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065746',
          uploadType: UploadTypeEnum.UPLOADED,
          errors: [],
        },
      ],
    })
  })
})
