import { getUrlsFromUploads } from './UploadsCard'

describe('getUrlsFromUploads', () => {
  let fetchMock: ReturnType<typeof vi.fn>
  let createObjectURLMock: ReturnType<typeof vi.fn>
  let revokeObjectURLMock: ReturnType<typeof vi.fn>
  let appendChildMock: ReturnType<typeof vi.fn>
  let removeChildMock: ReturnType<typeof vi.fn>
  let createElementMock: ReturnType<typeof vi.fn>

  const mockObjectUrl = 'blob:mock-url'
  let mockLinkElement: HTMLAnchorElement

  beforeEach(() => {
    // Mock fetch
    fetchMock = vi.fn().mockResolvedValue({
      blob: () => Promise.resolve(new Blob(['test content'], { type: 'text/plain' })),
    })
    global.fetch = fetchMock

    // Mock URL methods
    createObjectURLMock = vi.fn().mockReturnValue(mockObjectUrl)
    revokeObjectURLMock = vi.fn()
    global.URL.createObjectURL = createObjectURLMock
    global.URL.revokeObjectURL = revokeObjectURLMock

    // Mock document methods
    mockLinkElement = {
      href: '',
      setAttribute: vi.fn(),
      click: vi.fn(),
    } as unknown as HTMLAnchorElement

    createElementMock = vi.fn().mockReturnValue(mockLinkElement)
    appendChildMock = vi.fn()
    removeChildMock = vi.fn()
    
    document.createElement = createElementMock
    document.body.appendChild = appendChildMock
    document.body.removeChild = removeChildMock
  })

  it('correctly downloads files from provided URLs', async () => {
    const provider = 'travis'
    const groupedUploads = {
      travis: [
        { downloadUrl: '/download/file1.txt' },
        { downloadUrl: '/download/file2.txt' }
      ]
    }

    await getUrlsFromUploads(provider, groupedUploads)

    // Check that fetch was called for each upload
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0][0]).toBe('/download/file1.txt')
    expect(fetchMock.mock.calls[1][0]).toBe('/download/file2.txt')

    // Verify content-type header was set
    expect(fetchMock.mock.calls[0][1]).toEqual({
      headers: { 'Content-Type': 'text/plain' }
    })

    // Check URL and DOM operations
    expect(createObjectURLMock).toHaveBeenCalledTimes(2)
    expect(mockLinkElement.setAttribute).toHaveBeenCalledTimes(2)
    expect(mockLinkElement.setAttribute).toHaveBeenCalledWith('download', 'file1.txt')
    expect(mockLinkElement.setAttribute).toHaveBeenCalledWith('download', 'file2.txt')
  })

  it('handles case when provider has no uploads', async () => {
    const provider = 'travis'
    const groupedUploads = { otherProvider: [{ downloadUrl: '/download/file.txt' }] }

    await getUrlsFromUploads(provider, groupedUploads)

    expect(fetchMock).not.toHaveBeenCalled()
  })
})