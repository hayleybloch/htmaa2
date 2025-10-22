import { HtmlBasePlugin, IdAttributePlugin, InputPathToUrlTransformPlugin } from "@11ty/eleventy";
// Make the RSS plugin optional: try to load it at runtime so dev environments
// without the package installed can still run Eleventy.
let feedPlugin = null;
try {
  const mod = await import("@11ty/eleventy-plugin-rss");
  feedPlugin = mod?.default || mod?.feedPlugin || mod;
} catch (e) {
  console.warn("Optional plugin @11ty/eleventy-plugin-rss not found; continuing without RSS feed generation.");
}
import { createHighlighter } from "shiki";

export default async function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);
  eleventyConfig.addPlugin(IdAttributePlugin);

  eleventyConfig.addPlugin(feedPlugin, {
    type: "rss",
    outputPath: "/feed.xml",
    collection: {
      name: "posts",
      limit: 10,
    },
    metadata: {
      language: "en",
      title: "Hayley Bloch — HTMAA Portfolio",
  base: "https://fab.cba.mit.edu/classes/863.25/people/HayleyBloch/",
      author: {
        name: "Hayley Bloch",
      },
    },
  });

  eleventyConfig.addPassthroughCopy("src/style.css");
  eleventyConfig.addPassthroughCopy("src/**/*.{webp,step,FCStd,txt,svg,mp4,cpp,ino,3mf,obj,zip,dxf,sbp}", { mode: "html-relative" });
  eleventyConfig.addPassthroughCopy("src/**/code/**/*.{html,md}", { mode: "html-relative" });

  eleventyConfig.ignores.add("src/**/code/**");

  eleventyConfig.addFilter("humanDate", (dateObj) => new Date(dateObj).toLocaleDateString("en-US"));
  eleventyConfig.addFilter("machineDate", (dateObj) => new Date(dateObj).toISOString());

  // Try to load shiki for syntax highlighting; fall back to a simple safe highlighter
  let highlighter = null;
  try {
    const shiki = await import('shiki');
    highlighter = await shiki.createHighlighter({
      themes: ["dark-plus"],
      langs: ["js", "jsx", "ts", "tsx", "html", "css", "diff", "yaml", "json", "cpp", "sh"],
    });
  } catch (e) {
    console.warn('Optional package `shiki` not found; code blocks will not be syntax highlighted.');
    // Provide a minimal fallback so eleventyConfig.amendLibrary can call `highlighter.codeToHtml`
    highlighter = {
      codeToHtml(code) {
        const escaped = String(code)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        return `<pre class="language-plain"><code>${escaped}</code></pre>`;
      }
    };
  }

  function lazyImagesPlugin(md) {
    const defaultRender =
      md.renderer.rules.image ||
      function (tokens, idx, options, env, renderer) {
        return renderer.renderToken(tokens, idx, options);
      };

    md.renderer.rules.image = function (tokens, idx, options, env, renderer) {
      const token = tokens[idx];

      if (!token.attrGet("loading")) {
        token.attrSet("loading", "lazy");
      }

      if (!token.attrGet("decoding")) {
        token.attrSet("decoding", "async");
      }

      return defaultRender(tokens, idx, options, env, renderer);
    };
  }

  eleventyConfig.amendLibrary("md", (md) => {
    md.set({
      highlight: (code, lang) => highlighter.codeToHtml(code, { lang, theme: "dark-plus" }),
    });

    md.use(lazyImagesPlugin);
  });

  return {
    dir: {
      input: "src",
      output: "public",
    },
  pathPrefix: "/classes/863.25/people/HayleyBloch/",
  };
}
