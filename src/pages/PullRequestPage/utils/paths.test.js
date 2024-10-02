import {
  fileviewString,
  pullFileviewString,
  pullTreeviewString,
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

describe('pullTreeviewString', () => {
  it('returns a string', () => {
    expect(
      pullTreeviewString({ owner: 'foo', repo: 'bar', pullId: '123' })
    ).toBe('foo/bar/pull/123/tree')
  })
})

describe('pullFileviewString', () => {
  it('returns a string', () => {
    expect(
      pullFileviewString({ owner: 'foo', repo: 'bar', pullId: '123' })
    ).toBe('foo/bar/pull/123/blob')
  })
})
