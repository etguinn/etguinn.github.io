import { readFileSync } from "node:fs";

const site = JSON.parse(readFileSync("./src/_data/site.json", "utf8"));

/** "Sep 14, 2026" — forced to UTC so a date never drifts a day by timezone. */
const readable = (d) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);

/* Drafts render locally so you can preview them, but never in a real build. */
const isProduction = process.env.ELEVENTY_RUN_MODE === "build";
const isPublished = (item) => !(item.data.draft && isProduction);

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

/* Normalize a post's tags into a clean string array. Accepts an array, a
   single string, or a comma-separated string, so older `topic:` posts and the
   newer `topics:` array both work. */
const topicList = (raw) => {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : String(raw).split(",");
  return list.map((t) => String(t).trim()).filter(Boolean);
};
const topicsOf = (data) => topicList(data.topics ?? data.topic);

export default function (eleventyConfig) {
  // Static assets copied through untouched.
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });

  // Rebuild the browser when CSS changes during `npm run dev`.
  eleventyConfig.addWatchTarget("src/css/");

  eleventyConfig.addFilter("readableDate", readable);
  eleventyConfig.addFilter("htmlDate", (d) => d.toISOString().slice(0, 10));
  eleventyConfig.addFilter("rfc3339", (d) => d.toISOString());
  eleventyConfig.addFilter("year", (d) => d.getUTCFullYear());
  eleventyConfig.addFilter("slug", slugify);

  // Normalize a raw `topics`/`topic` value into a clean array, for templates.
  eleventyConfig.addFilter("topicList", topicList);
  eleventyConfig.addFilter("absoluteUrl", (path) =>
    new URL(path, site.url).href
  );

  // Strip HTML and clamp, for feed summaries and meta descriptions.
  eleventyConfig.addFilter("excerpt", (content, limit = 200) => {
    const text = String(content).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return text.length <= limit ? text : text.slice(0, text.lastIndexOf(" ", limit)) + "…";
  });

  // Newest first.
  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByTag("posts").filter(isPublished).sort((a, b) => b.date - a.date)
  );

  // One entry per tag, each with its posts — powers /topics/<slug>/. A post
  // lands under every tag it carries, so a tag page lists all its posts.
  eleventyConfig.addCollection("topics", (api) => {
    const byTopic = new Map();
    for (const post of api.getFilteredByTag("posts")) {
      if (!isPublished(post)) continue;
      for (const name of topicsOf(post.data)) {
        if (!byTopic.has(name)) byTopic.set(name, []);
        byTopic.get(name).push(post);
      }
    }
    return [...byTopic.entries()]
      .map(([name, posts]) => ({
        name,
        slug: slugify(name),
        posts: posts.sort((a, b) => b.date - a.date),
      }))
      .sort((a, b) => b.posts.length - a.posts.length || a.name.localeCompare(b.name));
  });

  // Posts grouped by year, newest year first — powers /archive/.
  eleventyConfig.addCollection("postsByYear", (api) => {
    const byYear = new Map();
    for (const post of api.getFilteredByTag("posts")) {
      if (!isPublished(post)) continue;
      const y = post.date.getUTCFullYear();
      if (!byYear.has(y)) byYear.set(y, []);
      byYear.get(y).push(post);
    }
    return [...byYear.entries()]
      .map(([year, posts]) => ({ year, posts: posts.sort((a, b) => b.date - a.date) }))
      .sort((a, b) => b.year - a.year);
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
