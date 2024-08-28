import cs from 'classnames'
import Highlight, { defaultProps } from 'prism-react-renderer'
import { useParams } from 'react-router-dom'

import { useCommitYaml } from 'services/commit'
import 'shared/utils/prism/prismTheme.css'

import './YAMLViewer.css'

function YAMLViewer() {
  const { provider, owner, repo, commit } = useParams()
  const { data: yamlContent } = useCommitYaml({
    provider,
    owner,
    repo,
    commitid: commit,
  })

  return (
    <Highlight
      {...defaultProps}
      code={yamlContent}
      language="yaml"
      theme={undefined}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={cs(
            className,
            'border-solid border-ds-gray-tertiary border pl-2'
          )}
          style={style}
        >
          {tokens.map((line, i) => (
            <div
              key={i}
              {...getLineProps({ line, key: i })}
              className="table-row"
            >
              <div className="line-number table-cell select-none border-r border-solid border-ds-gray-tertiary px-2 text-right">
                {i + 1}
              </div>
              <div className="table-cell pl-2">
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  )
}

export default YAMLViewer
