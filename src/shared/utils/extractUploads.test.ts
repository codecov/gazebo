import { UploadStateEnum, UploadTypeEnum } from './commit'
import {
  deleteDuplicateCFFUploads,
  extractUploads,
  Upload,
} from './extractUploads'

const travisObject = {
  id: 2,
  jobCode: 'blah',
  buildCode: 'ok',
  name: 'whatevs',
  state: UploadStateEnum.processed,
  provider: 'travis',
  createdAt: '2020-08-25T16:36:25.820340+00:00',
  updatedAt: '2020-08-25T16:36:25.859889+00:00',
  flags: ['flag1', 'flag2'],
  downloadUrl:
    '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/18b19f8d-5df6-48bd-90eb-50578ed8812f.txt',
  ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065763',
  uploadType: UploadTypeEnum.UPLOADED,
  errors: [],
}
const travisObject2 = {
  id: 4,
  jobCode: 'blah',
  buildCode: 'ok',
  name: 'whatevz',
  state: UploadStateEnum.started,
  provider: 'travis',
  createdAt: '2020-08-25T16:37:25.820340+00:00',
  updatedAt: '2020-08-25T16:37:25.859889+00:00',
  flags: ['flag1', 'flag2'],
  downloadUrl:
    '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/18b19f8d-5df6-48bd-90eb-50578ed8812f.txt',
  ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065763',
  uploadType: UploadTypeEnum.UPLOADED,
  errors: [],
}
const circleciObject = {
  id: 1,
  jobCode: 'blah',
  buildCode: 'ok',
  name: 'asdf',
  state: UploadStateEnum.error,
  provider: 'circleci',
  createdAt: '2020-08-25T16:36:19.559474+00:00',
  updatedAt: '2020-08-25T16:36:19.679868+00:00',
  flags: ['flag1'],
  downloadUrl:
    '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
  ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065746',
  uploadType: UploadTypeEnum.UPLOADED,
  errors: [],
}
const circleciObject2 = {
  id: 3,
  jobCode: 'blah',
  buildCode: 'ok',
  name: 'zzzz',
  state: UploadStateEnum.error,
  provider: 'circleci',
  createdAt: '2020-08-25T16:37:19.559474+00:00',
  updatedAt: '2020-08-25T16:37:19.679868+00:00',
  flags: ['flag1'],
  downloadUrl:
    '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
  ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065746',
  uploadType: UploadTypeEnum.UPLOADED,
  errors: [],
}
const noProviderObject = {
  id: 0,
  jobCode: 'asdf',
  buildCode: 'ok',
  name: 'noProvider',
  state: UploadStateEnum.error,
  provider: null,
  createdAt: '2020-08-26T16:36:19.559474+00:00',
  updatedAt: '2020-08-26T16:36:19.679868+00:00',
  flags: ['flag1', 'flag2'],
  downloadUrl:
    '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
  ciUrl: null,
  uploadType: UploadTypeEnum.UPLOADED,
  errors: [],
}
const noProviderObject2 = {
  id: 0,
  jobCode: '123',
  buildCode: 'ok',
  name: 'noProvider',
  state: UploadStateEnum.uploaded,
  provider: null,
  createdAt: '2020-08-26T16:37:19.559474+00:00',
  updatedAt: '2020-08-26T16:37:19.679868+00:00',
  flags: ['flag1'],
  downloadUrl:
    '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
  ciUrl: null,
  uploadType: UploadTypeEnum.UPLOADED,
  errors: [],
}
const noProviderObject3 = {
  id: 0,
  jobCode: '123',
  buildCode: 'ok',
  name: 'noProvider',
  state: UploadStateEnum.uploaded,
  provider: null,
  createdAt: '2020-08-26T16:37:19.559474+00:00',
  updatedAt: '2020-08-26T16:37:19.679868+00:00',
  flags: ['flag1'],
  downloadUrl:
    '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
  ciUrl: null,
  uploadType: UploadTypeEnum.UPLOADED,
  errors: [],
}

const mockUploads: Upload[] = [
  travisObject,
  travisObject2,
  circleciObject,
  circleciObject2,
  noProviderObject,
  noProviderObject2,
  noProviderObject3,
]

describe('extractUploads', () => {
  describe('uploads', () => {
    it('returns groupedUploads', () => {
      const { groupedUploads } = extractUploads({
        unfilteredUploads: mockUploads,
      })

      expect(groupedUploads).toStrictEqual({
        travis: [travisObject2, travisObject],
        circleci: [circleciObject2, circleciObject],
        none: [noProviderObject3, noProviderObject2, noProviderObject],
      })
    })

    it('returns upload providers', () => {
      const { uploadsProviderList } = extractUploads({
        unfilteredUploads: mockUploads,
      })

      expect(uploadsProviderList).toStrictEqual(['travis', 'circleci', 'none'])
    })

    it('returns overview summary', () => {
      const { uploadsOverview } = extractUploads({
        unfilteredUploads: mockUploads,
      })

      expect(uploadsOverview).toEqual(
        '2 uploaded, 1 started, 3 errored, 1 successful'
      )
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
        circleci: [circleciObject2, circleciObject],
        none: [noProviderObject],
      })
    })

    it('returns flagErrorUploads', () => {
      const { flagErrorUploads } = extractUploads({
        unfilteredUploads: mockUploads,
      })

      expect(flagErrorUploads).toStrictEqual({
        travis: [travisObject2, travisObject],
        none: [noProviderObject],
      })
    })

    it('returns searchResults', () => {
      const { searchResults } = extractUploads({
        unfilteredUploads: mockUploads,
      })

      expect(searchResults).toStrictEqual([])
    })

    it('handles undefined inputs', () => {
      const result = extractUploads({})
      expect(result).toStrictEqual({
        groupedUploads: {},
        uploadsProviderList: [],
        uploadsOverview: '',
        erroredUploads: {},
        flagErrorUploads: {},
        hasNoUploads: true,
      })
    })
  })

  describe('filtering and searching', () => {
    it('filters groupedUploads by flag errors', () => {
      const { groupedUploads } = extractUploads({
        unfilteredUploads: mockUploads,
        filters: {
          flagErrors: true,
          uploadErrors: false,
          searchTerm: '',
        },
      })

      expect(groupedUploads).toStrictEqual({
        travis: [travisObject2, travisObject],
        none: [noProviderObject],
      })
    })

    it('filters groupedUploads by upload errors', () => {
      const { groupedUploads } = extractUploads({
        unfilteredUploads: mockUploads,
        filters: {
          flagErrors: false,
          uploadErrors: true,
          searchTerm: '',
        },
      })

      expect(groupedUploads).toStrictEqual({
        circleci: [circleciObject2, circleciObject],
        none: [noProviderObject],
      })
    })

    it('searches by search term', () => {
      const { searchResults } = extractUploads({
        unfilteredUploads: mockUploads,
        filters: {
          flagErrors: false,
          uploadErrors: false,
          searchTerm: 'asdf',
        },
      })

      expect(searchResults).toStrictEqual([circleciObject, noProviderObject])
    })

    it('searches only filtered uploads if both present', () => {
      const { searchResults: uploadAndSearch } = extractUploads({
        unfilteredUploads: mockUploads,
        filters: {
          flagErrors: false,
          uploadErrors: true,
          searchTerm: 'asdf',
        },
      })

      expect(uploadAndSearch).toStrictEqual([circleciObject, noProviderObject])

      const { searchResults: flagAndSearch } = extractUploads({
        unfilteredUploads: mockUploads,
        filters: {
          flagErrors: true,
          uploadErrors: false,
          searchTerm: 'asdf',
        },
      })

      expect(flagAndSearch).toStrictEqual([noProviderObject])

      const { searchResults: allFiltersAndSearch } = extractUploads({
        unfilteredUploads: mockUploads,
        filters: {
          flagErrors: true,
          uploadErrors: true,
          searchTerm: 'asdf',
        },
      })

      expect(allFiltersAndSearch).toStrictEqual([
        circleciObject,
        noProviderObject,
      ])
    })
  })

  it('returns non-duplicate cff and regular uploads', () => {
    const uploads = [
      {
        id: 3,
        jobCode: 'blah',
        buildCode: 'ok',
        state: UploadStateEnum.complete,
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
        id: 4,
        jobCode: 'blah',
        buildCode: 'ok',
        state: UploadStateEnum.complete,
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
        id: 5,
        jobCode: 'blah',
        buildCode: 'ok',
        state: UploadStateEnum.complete,
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
        id: 6,
        jobCode: 'blah',
        buildCode: 'ok',
        state: UploadStateEnum.processed,
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

    const { groupedUploads } = extractUploads({ unfilteredUploads: uploads })
    expect(groupedUploads).toStrictEqual({
      circleci: [
        {
          id: 6,
          jobCode: 'blah',
          buildCode: 'ok',
          state: UploadStateEnum.processed,
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
        {
          id: 5,
          jobCode: 'blah',
          buildCode: 'ok',
          state: UploadStateEnum.complete,
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
      ],
    })
  })

  describe('deleteDuplicateCFFUploads', () => {
    it('returns total filtered uploads', () => {
      const uploads: Upload[] = [
        {
          state: UploadStateEnum.complete,
          id: 123,
          jobCode: '123',
          buildCode: '123',
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
          state: UploadStateEnum.complete,
          id: 234,
          jobCode: '234',
          buildCode: '234',
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
          state: UploadStateEnum.complete,
          id: 345,
          jobCode: '345',
          buildCode: '345',
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
          state: UploadStateEnum.processed,
          id: 456,
          jobCode: '456',
          buildCode: '456',
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

      const filteredUploads = deleteDuplicateCFFUploads({ uploads })

      expect(filteredUploads).toEqual([uploads[2], uploads[3]])
    })
  })
})
