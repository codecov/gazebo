import { fileviewString, newFileviewString, treeviewString } from './paths'

describe('newFileviewString', () => {
  it('returns a string', () => {
    expect(newFileviewString({ owner: 'foo', repo: 'bar' })).toBe(
      'foo/bar/blobs'
    )
  })
})

describe('treeviewString', () => {
  it('returns a string', () => {
    expect(treeviewString({ owner: 'foo', repo: 'bar' })).toBe('foo/bar/tree')
  })
})

describe('fileviewString', () => {
  it('returns a string', () => {
    expect(fileviewString({ owner: 'foo', repo: 'bar' })).toBe('foo/bar/blob')
  })
})
