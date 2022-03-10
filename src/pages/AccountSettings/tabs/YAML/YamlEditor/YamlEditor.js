import PropTypes from 'prop-types'
import { forwardRef } from 'react'
import AceEditor from 'react-ace'

import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/mode-yaml'
import './codecov-theme.css'

const YamlEditor = forwardRef(({ ...props }, ref) => {
  return (
    <AceEditor
      ref={ref}
      readOnly={!props?.isAdmin}
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
})

YamlEditor.displayName = 'YamlEditor'

YamlEditor.propTypes = {
  value: PropTypes.string,
  isAdmin: PropTypes.bool,
}

export default YamlEditor
