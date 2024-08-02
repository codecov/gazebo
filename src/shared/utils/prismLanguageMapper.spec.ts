import { prismLanguageMapper } from './prismLanguageMapper'

describe('prismLanguageMapper', () => {
  describe('when called with a file with a valid extension', () => {
    describe('html', () => {
      it('returns markup', () => {
        expect(prismLanguageMapper('file.html')).toBe('markup')
      })
    })

    describe('xml', () => {
      it('returns markup', () => {
        expect(prismLanguageMapper('file.xml')).toBe('markup')
      })
    })

    describe('svg', () => {
      it('returns markup', () => {
        expect(prismLanguageMapper('file.svg')).toBe('markup')
      })
    })

    describe('mathml', () => {
      it('returns markup', () => {
        expect(prismLanguageMapper('file.mathml')).toBe('markup')
      })
    })

    describe('ssml', () => {
      it('returns markup', () => {
        expect(prismLanguageMapper('file.ssml')).toBe('markup')
      })
    })

    describe('atom', () => {
      it('returns markup', () => {
        expect(prismLanguageMapper('file.atom')).toBe('markup')
      })
    })

    describe('rss', () => {
      it('returns markup', () => {
        expect(prismLanguageMapper('file.rss')).toBe('markup')
      })
    })

    describe('sh', () => {
      it('returns bash', () => {
        expect(prismLanguageMapper('file.sh')).toBe('bash')
      })
    })

    describe('c', () => {
      it('returns c', () => {
        expect(prismLanguageMapper('file.c')).toBe('c')
      })
    })

    describe('h', () => {
      it('returns clike', () => {
        expect(prismLanguageMapper('file.h')).toBe('clike')
      })
    })

    describe('cc', () => {
      it('returns cpp', () => {
        expect(prismLanguageMapper('file.cc')).toBe('cpp')
      })
    })

    describe('cpp', () => {
      it('returns cpp', () => {
        expect(prismLanguageMapper('file.cpp')).toBe('cpp')
      })
    })

    describe('css', () => {
      it('returns css', () => {
        expect(prismLanguageMapper('file.css')).toBe('css')
      })
    })

    describe('js', () => {
      it('returns javascript', () => {
        expect(prismLanguageMapper('file.js')).toBe('javascript')
      })
    })

    describe('cjs', () => {
      it('returns javascript', () => {
        expect(prismLanguageMapper('file.cjs')).toBe('javascript')
      })
    })

    describe('mjs', () => {
      it('returns javascript', () => {
        expect(prismLanguageMapper('file.mjs')).toBe('javascript')
      })
    })

    describe('jsx', () => {
      it('returns jsx', () => {
        expect(prismLanguageMapper('file.jsx')).toBe('jsx')
      })
    })

    describe('go', () => {
      it('returns go', () => {
        expect(prismLanguageMapper('file.go')).toBe('go')
      })
    })

    describe('gql', () => {
      it('returns graphql', () => {
        expect(prismLanguageMapper('file.gql')).toBe('graphql')
      })
    })

    describe('graphql', () => {
      it('returns graphql', () => {
        expect(prismLanguageMapper('file.graphql')).toBe('graphql')
      })
    })

    describe('json', () => {
      it('returns json', () => {
        expect(prismLanguageMapper('file.json')).toBe('json')
      })
    })

    describe('less', () => {
      it('returns less', () => {
        expect(prismLanguageMapper('file.less')).toBe('less')
      })
    })

    describe('objc', () => {
      it('returns objectivec', () => {
        expect(prismLanguageMapper('file.objc')).toBe('objectivec')
      })
    })

    describe('ocaml', () => {
      it('returns ocaml', () => {
        expect(prismLanguageMapper('file.ocaml')).toBe('ocaml')
      })
    })

    describe('py', () => {
      it('returns python', () => {
        expect(prismLanguageMapper('file.py')).toBe('python')
      })
    })

    describe('reason', () => {
      it('returns reason', () => {
        expect(prismLanguageMapper('file.reason')).toBe('reason')
      })
    })

    describe('sass', () => {
      it('returns sass', () => {
        expect(prismLanguageMapper('file.sass')).toBe('sass')
      })
    })

    describe('scss', () => {
      it('returns scss', () => {
        expect(prismLanguageMapper('file.scss')).toBe('scss')
      })
    })

    describe('sql', () => {
      it('returns sql', () => {
        expect(prismLanguageMapper('file.sql')).toBe('sql')
      })
    })

    describe('ts', () => {
      it('returns typescript', () => {
        expect(prismLanguageMapper('file.ts')).toBe('typescript')
      })
    })

    describe('tsx', () => {
      it('returns tsx', () => {
        expect(prismLanguageMapper('file.tsx')).toBe('tsx')
      })
    })

    describe('wasm', () => {
      it('returns wasm', () => {
        expect(prismLanguageMapper('file.wasm')).toBe('wasm')
      })
    })

    describe('yaml', () => {
      it('returns yaml', () => {
        expect(prismLanguageMapper('file.yaml')).toBe('yaml')
      })
    })
  })

  describe('when called with a file with an invalid extension', () => {
    it('defaults to markup', () => {
      expect(prismLanguageMapper('file.omgwhatisdis')).toBe('markup')
    })
  })
})
