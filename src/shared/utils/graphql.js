import get from 'lodash/get'

export function mapEdges(connection) {
  const edges = get(connection, 'edges', [])

  return edges.map((edge) => edge.node)
}
