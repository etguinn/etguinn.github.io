/* `draft: true` posts are visible while you write (npm run dev) but are never
   written out by a production build, so they can be committed safely. */
const isProduction = process.env.ELEVENTY_RUN_MODE === "build";

export default {
  layout: "post.njk",
  tags: ["posts"],
  eleventyComputed: {
    permalink: (data) =>
      data.draft && isProduction ? false : `/writing/${data.page.fileSlug}/`,
    eleventyExcludeFromCollections: (data) => Boolean(data.draft && isProduction),
  },
};
