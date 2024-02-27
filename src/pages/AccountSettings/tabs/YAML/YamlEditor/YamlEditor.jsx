import PropTypes from 'prop-types'
import { forwardRef } from 'react'
import AceEditor from 'react-ace'

import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/mode-yaml'
import './codecov-theme.css'

const YamlEditor = forwardRef(({ ...props }, ref) => {
  return (
    <div className="lg:w-2/3">
      <AceEditor
        ref={ref}
        mode="yaml"
        theme="github"
        name="yaml-editor"
        width="auto"
        minLines={80}
        highlightActiveLine={false}
        editorProps={{ $blockScrolling: true }}
        setOptions={{ useWorker: false }}
        {...props}
      />
    </div>
  )
})

YamlEditor.displayName = 'YamlEditor'

YamlEditor.propTypes = {
  value: PropTypes.string,
}

export default YamlEditor
