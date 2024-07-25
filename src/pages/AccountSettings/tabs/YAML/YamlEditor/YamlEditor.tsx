import { forwardRef } from 'react'
import AceEditor from 'react-ace'

import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/mode-yaml'
import './codecov-theme.css'

const YamlEditor = forwardRef<AceEditor>(({ ...props }, ref) => {
  return (
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
  )
})

YamlEditor.displayName = 'YamlEditor'

export default YamlEditor
