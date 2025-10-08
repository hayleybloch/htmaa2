import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Provide CSS variables for public path and common asset URLs so CSS can reference assets consistently */}
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--public-path:${process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH + '/' : '/'}; --font-galyon: url(${process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH + '/fonts/Galyon-Regular.woff' : '/fonts/Galyon-Regular.woff'}); --font-galyon-bold: url(${process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH + '/fonts/Galyon-Bold.woff' : '/fonts/Galyon-Bold.woff'}); --font-metropolis: url(${process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH + '/fonts/Metropolis-Medium.otf' : '/fonts/Metropolis-Medium.otf'}); --icon-spritesheet: url(${process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH + '/icons/icon-spritesheet.png' : '/icons/icon-spritesheet.png'});}`,
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
