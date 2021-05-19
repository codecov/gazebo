import PropTypes from 'prop-types'
import AceEditor from 'react-ace'

import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/mode-yaml'
import './codecov-theme.css'

function YamlEditor({ ...props }) {
  return (
    <AceEditor
      mode="yaml"
      theme="github"
      name="yaml-editor"
      width="auto"
      minLines={80}
      highlightActiveLine={false}
      editorProps={{ $blockScrolling: true }}
      {...props}
    ></AceEditor>
  )
}

YamlEditor.propTypes = {
  value: PropTypes.string,
}

export default YamlEditor
