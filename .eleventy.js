module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "apps/desktop/public/images": "images" });
  eleventyConfig.addPassthroughCopy({ "apps/desktop/public/icons": "icons" });
  eleventyConfig.addPassthroughCopy({ "apps/desktop/public/fonts": "fonts" });

  eleventyConfig.addCollection('weeks', function(collectionApi) {
    return collectionApi.getFilteredByGlob('src/weeks/*.md').sort(function(a,b){
      return (a.date || 0) - (b.date || 0);
    });
  });

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: 'public'
    }
  };
};
