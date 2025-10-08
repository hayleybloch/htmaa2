import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Provide CSS variables for public path and commonly-used asset URLs so CSS can reference assets consistently */}
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--public-path:${process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH + '/' : '/'}; --font-century: url(${process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH + '/desktop/fonts/century_schoolbook.ttf' : '/desktop/fonts/century_schoolbook.ttf'}); --font-noto: url(${process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH + '/desktop/fonts/noto_serif_toto.ttf' : '/desktop/fonts/noto_serif_toto.ttf'}); --icon-spritesheet: url(${process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH + '/desktop/icons/icon-spritesheet.png' : '/desktop/icons/icon-spritesheet.png'}); }`,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
