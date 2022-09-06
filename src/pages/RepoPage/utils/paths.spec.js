import { fileviewString, treeviewString } from './paths'

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
