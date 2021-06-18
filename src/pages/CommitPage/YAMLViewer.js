import PropTypes from 'prop-types'
import Highlight, { defaultProps } from 'prism-react-renderer'
import githubTheme from 'prism-react-renderer/themes/github'

function YAMLViewer({ YAML }) {
  return (
    <Highlight
      {...defaultProps}
      theme={githubTheme}
      code={YAML}
      language="yaml"
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={style}>
          {tokens.map((line, i) => (
            <div
              key={i}
              {...getLineProps({ line, key: i })}
              className="table-row"
            >
              <div className="table-cell px-2 text-right bg-ds-gray-secondary">
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
