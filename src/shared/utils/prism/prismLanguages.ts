// @ts-nocheck - We're adding this here because there are no types for the prismjs package even after installing the @types/prismjs package
;(async () => {
  // import languages with no extends()
  await Promise.all([
    import('prismjs/components/prism-clike'),
    import('prismjs/components/prism-elixir'),
    import('prismjs/components/prism-fortran'),
    import('prismjs/components/prism-julia'),
    import('prismjs/components/prism-lua'),
    import('prismjs/components/prism-markup'),
    import('prismjs/components/prism-php'),
    import('prismjs/components/prism-powershell'),
    import('prismjs/components/prism-r'),
    import('prismjs/components/prism-rust'),
    import('prismjs/components/prism-swift'),
    import('prismjs/components/prism-visual-basic'),
    import('prismjs/components/prism-zig'),
  ])

  // import languages that extend base languages
  await Promise.all([
    import('prismjs/components/prism-csharp'),
    import('prismjs/components/prism-dart'),
    import('prismjs/components/prism-fsharp'),
    import('prismjs/components/prism-java'),
    import('prismjs/components/prism-kotlin'),
    import('prismjs/components/prism-ruby'),
    import('prismjs/components/prism-solidity'),
  ])

  // import next level of languages
  await Promise.all([
    import('prismjs/components/prism-cshtml'),
    import('prismjs/components/prism-scala'),
  ])
})()

export {}
