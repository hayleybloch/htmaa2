import Head from "next/head";
import { SceneLoader } from "../components";
import { useEffect, useState } from "react";
import { NoScriptWarning } from "@/components/noscript/NoScript";

const focusedTitle = "Hayley Bloch - Portfolio";
const blurredTitle = "Hayley Bloch - Portfolio";

export default function Web() {
  const [title, setTitle] = useState("Hayley Bloch - Portfolio");

  function onVisibilityChange() {
    const title = document.visibilityState === 'visible' ? focusedTitle : blurredTitle;

    setTitle(title);
  }

  useEffect(() => {
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }

  }, []);

  return (
    <>
      <Head>
        <title>{title}</title>

        <meta name="description" content="Hayley Bloch - HTMAA student at MIT exploring digital fabrication, electronics, and creative engineering" />

        <meta property="og:title" content="Hayley Bloch - HTMAA Portfolio" />
        <meta property="og:description" content="MIT HTMAA student showcasing digital fabrication projects, electronics, and creative engineering work" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://hayleybloch.github.io/htmaa2/assets/thumbnail.png" />
        <meta property="og:url" content="https://hayleybloch.github.io/htmaa2/" />
        
        <meta property="twitter:image" content="https://hayleybloch.github.io/htmaa2/assets/thumbnail.png"/>
        <meta property="twitter:card" content="summary_large_image"/>
        <meta property="twitter:title" content="Hayley Bloch - HTMAA Portfolio"/>
        <meta property="twitter:description" content="MIT HTMAA student showcasing digital fabrication projects, electronics, and creative engineering work"/>
        <meta property="og:site_name" content="Hayley Bloch's portfolio"></meta>

        <link rel="icon" type="image/x-icon" href="favicon.ico" />
      </Head>
      <NoScriptWarning />
      <SceneLoader />
    </>
  );
}
