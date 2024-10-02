import {
  commitFileviewString,
  commitTreeviewString,
  fileviewString,
  treeviewString,
} from './paths'

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

describe('commitTreeviewString', () => {
  it('returns a string', () => {
    expect(
      commitTreeviewString({ owner: 'foo', repo: 'bar', commitSha: 'sha256' })
    ).toBe('foo/bar/commit/sha256/tree')
  })
})

describe('commitFileviewString', () => {
  it('returns a string', () => {
    expect(
      commitFileviewString({ owner: 'foo', repo: 'bar', commitSha: 'sha256' })
    ).toBe('foo/bar/commit/sha256/blob')
  })
})
