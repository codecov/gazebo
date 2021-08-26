import PropTypes from 'prop-types'
import cs from 'classnames'
import Highlight, { defaultProps } from 'prism-react-renderer'
import { useParams } from 'react-router-dom'

import 'shared/utils/prisimTheme.css'
import './YAMLViewer.css'

import { useCommitYaml } from 'services/commit'
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
              <div className="line-number table-cell px-2 text-right border-r border-solid border-ds-gray-tertiary">
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

YAMLViewer.propTypes = {
  YAML: PropTypes.string.isRequired,
}

export default YAMLViewer
