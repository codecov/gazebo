import { useRef } from 'react'
import PropTypes from 'prop-types'
import AceEditor from 'react-ace'
import { sanitize } from 'dompurify'

// TODO ship custom theme
import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/mode-yaml'

// This should be lazily loaded!

const temp = 'coverage:\n\tprecision: 5\n\tround: down\n'

function FileEditor({ language = 'yaml', value = temp, onChange, ...props }) {
  const editor = useRef()

  const onChangeFn = (value) => {
    onChange(sanitize(value))
  }

  const onLoad = (intance) => {
    intance.container.style.resize = 'both'
  }

  return (
    <AceEditor
      ref={editor}
      mode={language}
      theme="codecov"
      onChange={onChangeFn}
      onLoad={onLoad}
      name="fileEditor"
      editorProps={{ $blockScrolling: true }}
      value={value}
      {...props}
    ></AceEditor>
  )
}

FileEditor.propTypes = {
  language: PropTypes.oneOf(['yaml']),
  value: PropTypes.string,
  onChange: PropTypes.func,
}

export default FileEditor
