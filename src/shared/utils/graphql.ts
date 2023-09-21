import isNull from 'lodash/isNull'
import isUndefined from 'lodash/isUndefined'

type Connection<TNode> =
  | {
      edges: Array<{ node: TNode } | null>
    }
  | undefined
  | null

type MapEdgesOpts =
  | {
      includeNullNodes: boolean
    }
  | undefined

const defaultMapEdgesOpts = {
  includeNullNodes: false,
}

export function mapEdges<TNode>(
  connection: Connection<TNode>,
  options?: { includeNullNodes: false } | undefined
): Array<TNode>

export function mapEdges<TNode>(
  connection: Connection<TNode>,
  options: { includeNullNodes: true }
): Array<TNode | null>

export function mapEdges<TNode>(
  connection: Connection<TNode>,
  options?: MapEdgesOpts
) {
  const mergedOptions = {
    ...defaultMapEdgesOpts,
    ...options,
  }

  let edges = []
  if (!isUndefined(connection) && !isNull(connection)) {
    for (const edge of connection.edges) {
      if (edge?.node) {
        edges.push(edge.node)
      } else if (mergedOptions.includeNullNodes && isNull(edge)) {
        edges.push(edge)
      }
    }
  }

  return edges
}
