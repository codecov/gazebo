import { mapEdges } from './graphql'

describe('mapEdges', () => {
  describe('passed a connection', () => {
    it('returns the mapped edges', () => {
      const connection = {
        edges: [{ node: { hello: 'world' } }, null],
      }

      const mapped = mapEdges(connection)

      expect(mapped).toStrictEqual([{ hello: 'world' }, null])
    })
  })

  describe('arg is undefined', () => {
    it('returns an empty array', () => {
      const mapped = mapEdges(undefined)

      expect(mapped).toStrictEqual([])
    })
  })

  describe('arg is null', () => {
    it('returns an empty array', () => {
      const mapped = mapEdges(null)

      expect(mapped).toStrictEqual([])
    })
  })
})
