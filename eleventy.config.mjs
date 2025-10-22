import { HtmlBasePlugin, IdAttributePlugin, InputPathToUrlTransformPlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
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
      base: "https://gitlab.cba.mit.edu/classes/863.25/people/HayleyBloch/",
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

  const highlighter = await createHighlighter({
    themes: ["dark-plus"],
    langs: ["js", "jsx", "ts", "tsx", "html", "css", "diff", "yaml", "json", "cpp", "sh"],
  });

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
