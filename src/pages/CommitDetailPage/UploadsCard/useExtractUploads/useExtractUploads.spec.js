import { renderHook } from '@testing-library/react-hooks'

import { useExtractUploads } from './useExtractUploads'

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

describe('useExtractUploads', () => {
  let hookData

  function setup() {
    hookData = renderHook(() => useExtractUploads({ uploads: mockUploads }))
  }

  describe('uploads', () => {
    beforeEach(() => {
      setup()
    })

    it('returns sortedUploads', () => {
      expect(hookData.result.current.sortedUploads).toEqual({
        travis: [travisObject],
        circleci: [circleciObject],
      })
    })

    it('returns upload providers', () => {
      expect(hookData.result.current.uploadsProviderList).toEqual([
        'travis',
        'circleci',
      ])
    })

    it('returns overview summary', () => {
      expect(hookData.result.current.uploadsOverview).toEqual(
        '1 started, 1 errored'
      )
    })

    it('returns hasNoUploads', () => {
      expect(hookData.result.current.hasNoUploads).toEqual(false)
    })

    it('returns erroredUploads', () => {
      expect(hookData.result.current.erroredUploads).toEqual({
        circleci: [circleciObject],
      })
    })
  })
})
