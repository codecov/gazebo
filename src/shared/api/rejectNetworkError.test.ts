import {
  _rejectNetworkError,
  determineSentryLevel,
  determineStatusCode,
  NetworkErrorName,
  NotFoundErrorObject,
  OwnerNotActivatedErrorObject,
  ParsingErrorObject,
} from './rejectNetworkError'

const mocks = vi.hoisted(() => ({
  withScope: vi.fn(),
  addBreadcrumb: vi.fn(),
  captureMessage: vi.fn(),
  setFingerprint: vi.fn(),
  setTags: vi.fn(),
  setLevel: vi.fn(),
}))

vi.mock('@sentry/react', async () => {
  const actual = await vi.importActual('@sentry/react')
  return {
    ...actual,
    withScope: mocks.withScope.mockImplementation((fn) =>
      fn({
        addBreadcrumb: mocks.addBreadcrumb,
        setFingerprint: mocks.setFingerprint,
        captureMessage: mocks.captureMessage,
        setTags: mocks.setTags,
        setLevel: mocks.setLevel,
      })
    ),
  }
})

afterEach(() => {
  vi.clearAllMocks()
})

const parsingError: ParsingErrorObject = {
  errorName: 'Parsing Error',
  errorDetails: {
    error: Error('bad parsing'),
    caller: 'TestQueryOpts',
  },
}

const notFoundError: NotFoundErrorObject = {
  errorName: 'Not Found Error',
  errorDetails: {
    caller: 'TestQueryOpts',
  },
}

const ownerNotActivatedError: OwnerNotActivatedErrorObject = {
  errorName: 'Owner Not Activated',
  data: { detail: 'test' },
  errorDetails: {
    caller: 'TestQueryOpts',
  },
}

describe('rejectNetworkError', () => {
  const testCases = [
    { errorObject: parsingError, level: 'error', status: 400 },
    { errorObject: notFoundError, level: 'info', status: 404 },
    { errorObject: ownerNotActivatedError, level: 'info', status: 403 },
  ]

  describe.each(testCases)(
    'when the error is $errorObject.errorName',
    ({ errorObject, level, status }) => {
      it('adds a breadcrumb', () => {
        _rejectNetworkError(errorObject).catch((_e) => {})

        expect(mocks.addBreadcrumb).toHaveBeenCalledWith({
          category: 'network.error',
          level,
          message: `${errorObject.errorDetails.caller} - ${errorObject.errorName}`,
          data:
            'error' in errorObject.errorDetails
              ? errorObject.errorDetails.error
              : undefined,
        })
      })

      it('sets the tags', () => {
        _rejectNetworkError(errorObject).catch((_e) => {})

        expect(mocks.setTags).toHaveBeenCalledWith({
          caller: errorObject.errorDetails.caller,
          errorName: errorObject.errorName,
        })
      })

      it('sets the level', () => {
        _rejectNetworkError(errorObject).catch((_e) => {})

        expect(mocks.setLevel).toHaveBeenCalledWith(level)
      })

      it('sets the fingerprint', () => {
        _rejectNetworkError(errorObject).catch((_e) => {
          expect(mocks.setFingerprint).toHaveBeenCalledWith([
            `${errorObject.errorDetails.caller} - ${errorObject.errorName}`,
          ])
        })
      })

      it('captures the error with Sentry', () => {
        _rejectNetworkError(errorObject).catch((_e) => {})

        expect(mocks.captureMessage).toHaveBeenCalledWith(
          `${errorObject.errorDetails.caller} - ${errorObject.errorName}`
        )
      })

      it('returns a rejected promise', () => {
        const result = _rejectNetworkError(errorObject)

        expect(result).rejects.toStrictEqual({
          dev: `${errorObject.errorDetails.caller} - ${errorObject.errorName}`,
          data: 'data' in errorObject ? errorObject.data : undefined,
          status,
        })
      })
    }
  )
})

describe('determineSentryLevel', () => {
  const testCases = [
    { errorName: 'Parsing Error', level: 'error' },
    { errorName: 'Not Found Error', level: 'info' },
    { errorName: 'Owner Not Activated', level: 'info' },
    { errorName: 'Unknown Error', level: 'error' },
  ]

  describe.each(testCases)(
    'when the error is $errorName',
    ({ errorName, level }) => {
      it('returns the correct level', () => {
        // casting here to avoid type error
        expect(determineSentryLevel(errorName as NetworkErrorName)).toBe(level)
      })
    }
  )
})

describe('determineStatusCode', () => {
  const testCases = [
    { errorName: 'Parsing Error', status: 400 },
    { errorName: 'Not Found Error', status: 404 },
    { errorName: 'Owner Not Activated', status: 403 },
    { errorName: 'Unknown Error', status: 400 },
  ]

  describe.each(testCases)(
    'when the error is $errorName',
    ({ errorName, status }) => {
      it('returns the correct status code', () => {
        // casting here to avoid type error
        expect(determineStatusCode(errorName as NetworkErrorName)).toBe(status)
      })
    }
  )
})
