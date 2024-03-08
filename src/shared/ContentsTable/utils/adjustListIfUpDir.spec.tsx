import A from 'ui/A'

import { adjustListIfUpDir } from './adjustListIfUpDir'

describe('adjustListIfUpDir', () => {
  describe('display type is set to tree', () => {
    describe('tree paths length is greater then one', () => {
      it('adds up dir entry', () => {
        const result = adjustListIfUpDir({
          treePaths: [
            { pageName: 'commitTreeView', text: 'src', options: {} },
            { pageName: 'commitTreeView', text: 'directory', options: {} },
          ],
          displayType: 'TREE',
          rawTableRows: [
            {
              name: <h1>file.asdf</h1>,
              lines: '',
              hits: '',
              misses: '',
              partials: '',
              coverage: <h1>so much</h1>,
            },
          ],
        })

        expect(result).toHaveLength(2)
        expect(result).toStrictEqual([
          {
            name: (
              /* @ts-expect-error */
              <A
                to={{ options: {}, pageName: 'commitTreeView', text: 'src' }}
                variant="upDirectory"
              >
                <div className="pl-1 ">..</div>
              </A>
            ),
            lines: '',
            hits: '',
            misses: '',
            partials: '',
            coverage: '',
          },
          {
            name: <h1>file.asdf</h1>,
            lines: '',
            hits: '',
            misses: '',
            partials: '',
            coverage: <h1>so much</h1>,
          },
        ])
      })
    })

    describe('tree paths length is less then one', () => {
      it('does not add up dir entry', () => {
        const result = adjustListIfUpDir({
          treePaths: [{ pageName: 'commitTreeView', text: 'src', options: {} }],
          displayType: 'TREE',
          rawTableRows: [
            {
              name: <h1>file.asdf</h1>,
              lines: '',
              hits: '',
              misses: '',
              partials: '',
              coverage: <h1>so much</h1>,
            },
          ],
        })

        expect(result).toHaveLength(1)
        expect(result).toStrictEqual([
          {
            name: <h1>file.asdf</h1>,
            lines: '',
            hits: '',
            misses: '',
            partials: '',
            coverage: <h1>so much</h1>,
          },
        ])
      })
    })
  })

  describe('display type is not set to tree', () => {
    describe('tree paths length is greater then one', () => {
      it('does not add up dir entry', () => {
        const result = adjustListIfUpDir({
          treePaths: [
            { pageName: 'commitTreeView', text: 'src', options: {} },
            { pageName: 'commitTreeView', text: 'directory', options: {} },
          ],
          displayType: 'LIST',
          rawTableRows: [
            {
              name: <h1>file.asdf</h1>,
              lines: '',
              hits: '',
              misses: '',
              partials: '',
              coverage: <h1>so much</h1>,
            },
          ],
        })

        expect(result).toHaveLength(1)
        expect(result).toStrictEqual([
          {
            name: <h1>file.asdf</h1>,
            lines: '',
            hits: '',
            misses: '',
            partials: '',
            coverage: <h1>so much</h1>,
          },
        ])
      })
    })

    describe('tree paths length is less then one', () => {
      it('does not add up dir entry', () => {
        const result = adjustListIfUpDir({
          treePaths: [{ pageName: 'commitTreeView', text: 'src', options: {} }],
          displayType: 'LIST',
          rawTableRows: [
            {
              name: <h1>file.asdf</h1>,
              lines: '',
              hits: '',
              misses: '',
              partials: '',
              coverage: <h1>so much</h1>,
            },
          ],
        })

        expect(result).toHaveLength(1)
        expect(result).toStrictEqual([
          {
            name: <h1>file.asdf</h1>,
            lines: '',
            hits: '',
            misses: '',
            partials: '',
            coverage: <h1>so much</h1>,
          },
        ])
      })
    })
  })
})
