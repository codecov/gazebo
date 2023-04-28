import CodeRendererProgressHeader from './CodeRendererProgressHeader'

export const SimpleCodeRendererProgressHeader = {
  args: {
    treePaths: [],
    fileCoverage: 39.28,
    change: 34.21,
  },
}

export const CodeRendererProgressHeaderWithTreepaths = {
  args: {
    treePaths: [{ pageName: 'owner', text: 'owner' }],
    fileCoverage: 14.28,
    change: 34.21,
  },
}

export const CodeRendererProgressHeaderWithoutChange = {
  args: {
    treePaths: [],
    fileCoverage: 39.28,
  },
}

export default {
  title: 'Components/CodeRenderer/CodeRendererProgressHeader',
  component: CodeRendererProgressHeader,
}
