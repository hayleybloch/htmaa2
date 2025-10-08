import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Provide CSS variables for public path and commonly-used asset URLs so CSS can reference assets consistently */}
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--public-path:${process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH + '/' : '/'}; --font-century: url(${process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH + '/desktop/fonts/century_schoolbook.ttf' : '/fonts/century_schoolbook.ttf'}); --font-noto: url(${process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH + '/desktop/fonts/noto_serif_toto.ttf' : '/fonts/noto_serif_toto.ttf'}); --icon-spritesheet: url(${process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH + '/desktop/icons/icon-spritesheet.png' : '/icons/icon-spritesheet.png'}); }`,
          }}
        />

        {/* DEV HELP: remove Next's FOUC hide style early during development so the desktop doesn't remain white before hydration */}
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `try{(function(){var s=document.querySelector('style[data-next-hide-fouc]');if(s){s.parentNode.removeChild(s);}if(document && document.body){document.body.style.display='block';}else{document.addEventListener('DOMContentLoaded',function(){document.body&&(document.body.style.display='block');});}})();}catch(e){console.error('fouc-fix',e)}`,
            }}
          />
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
