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
            <tr key={i} {...getLineProps({ line, key: i })}>
              <td className="px-2 text-right bg-ds-gray-secondary">{i + 1}</td>
              <td className="pl-2">
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </td>
            </tr>
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
