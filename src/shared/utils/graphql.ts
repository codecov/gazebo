import isArray from 'lodash/isArray'
import isNull from 'lodash/isNull'
import isUndefined from 'lodash/isUndefined'

type Connection<TNode> =
  | {
      edges: Array<{ node: TNode } | null>
    }
  | undefined
  | null

export function mapEdges<TNode>(connection: Connection<TNode>) {
  const edges = []
  if (
    !isUndefined(connection) &&
    !isNull(connection) &&
    isArray(connection.edges)
  ) {
    for (const edge of connection.edges) {
      if (isNull(edge)) {
        edges.push(edge)
      } else {
        edges.push(edge.node)
      }
    }
  }

  return edges
}
