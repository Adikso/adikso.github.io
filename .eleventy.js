const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const excerpt = require("./extensions/excerpt");
const simpleDate = require("./extensions/simpleDate");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const pluginTOC = require('eleventy-plugin-toc');
const pluginRss = require("@11ty/eleventy-plugin-rss");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight, {
    templateFormats: "*",
    alwaysWrapLineHighlights: false,
  });
  eleventyConfig.addPlugin(pluginTOC, {
    wrapperClass: 'toc sidebar-toc sidebar-right'
  });
  eleventyConfig.addPlugin(pluginRss);
  
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addFilter("excerpt", excerpt);
  eleventyConfig.addFilter("simpleDate", simpleDate);
  eleventyConfig.addPairedShortcode("sidebar", function(content, position, title) { 
    return `<div class="sidebar sidebar-${position}"><div class="sidebar-title">${title || ''}</div>${content}</div>`
  });

  eleventyConfig.addPassthroughCopy("public.asc");
  eleventyConfig.addPassthroughCopy(".nojekyll");
  eleventyConfig.addPassthroughCopy(".well-known/");

  const markdownItOptions = {
    html: true,
  }
  const markdownItAnchorOptions = {
    permalink: false,
  }

  const markdownLib = markdownIt(markdownItOptions).use(
    markdownItAnchor,
    markdownItAnchorOptions
  )

  eleventyConfig.setLibrary("md", markdownLib)
};
