import PropTypes from 'prop-types'
import { sanitize } from 'dompurify'
import AceEditor from 'react-ace'

import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/mode-yaml'
import './codecov-theme.css'
function YamlEditor({ onChange, ...props }) {
  const onChangeFn = (value) => {
    onChange(sanitize(value))
  }

  return (
    <AceEditor
      mode="yaml"
      theme="github"
      name="yaml-editor"
      width="auto"
      minLines={80}
      highlightActiveLine={false}
      onChange={onChangeFn}
      editorProps={{ $blockScrolling: true }}
      {...props}
    ></AceEditor>
  )
}

YamlEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
}

export default YamlEditor
