var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// data/siteMetadata.js
var require_siteMetadata = __commonJS({
  "data/siteMetadata.js"(exports, module) {
    "use strict";
    var siteMetadata2 = {
      title: "Singularity",
      author: "Tails Azimuth",
      headerTitle: "Singularity",
      description: "Matthew Gong\u2019s personal portfolio and technical blog",
      language: "en-us",
      theme: "system",
      // system, dark or light
      siteUrl: "https://tailwind-nextjs-starter-blog.vercel.app",
      siteRepo: "https://github.com/timlrx/tailwind-nextjs-starter-blog",
      siteLogo: `${process.env.BASE_PATH || ""}/static/images/logo.png`,
      socialBanner: `${process.env.BASE_PATH || ""}/static/images/twitter-card.png`,
      mastodon: "https://mastodon.social/@mastodonuser",
      email: "address@yoursite.com",
      github: "https://github.com",
      x: "https://twitter.com/x",
      facebook: "https://facebook.com",
      youtube: "https://youtube.com",
      linkedin: "https://www.linkedin.com",
      threads: "https://www.threads.net",
      instagram: "https://www.instagram.com",
      medium: "https://medium.com",
      bluesky: "https://bsky.app/",
      locale: "en-US",
      // set to true if you want a navbar fixed to the top
      stickyNav: false,
      analytics: {
        // If you want to use an analytics provider you have to add it to the
        // content security policy in the `next.config.js` file.
        // supports Plausible, Simple Analytics, Umami, Posthog or Google Analytics.
        umamiAnalytics: {
          // We use an env variable for this site to avoid other users cloning our analytics ID
          umamiWebsiteId: process.env.NEXT_UMAMI_ID
          // e.g. 123e4567-e89b-12d3-a456-426614174000
          // You may also need to overwrite the script if you're storing data in the US - ex:
          // src: 'https://us.umami.is/script.js'
          // Remember to add 'us.umami.is' in `next.config.js` as a permitted domain for the CSP
        }
        // plausibleAnalytics: {
        //   plausibleDataDomain: '', // e.g. tailwind-nextjs-starter-blog.vercel.app
        // If you are hosting your own Plausible.
        //   src: '', // e.g. https://plausible.my-domain.com/js/script.js
        // },
        // simpleAnalytics: {},
        // posthogAnalytics: {
        //   posthogProjectApiKey: '', // e.g. 123e4567-e89b-12d3-a456-426614174000
        // },
        // googleAnalytics: {
        //   googleAnalyticsId: '', // e.g. G-XXXXXXX
        // },
      },
      comments: {
        // If you want to use an analytics provider you have to add it to the
        // content security policy in the `next.config.js` file.
        // Select a provider and use the environment variables associated to it
        // https://vercel.com/docs/environment-variables
        provider: "giscus",
        // supported providers: giscus, utterances, disqus
        giscusConfig: {
          // Visit the link below, and follow the steps in the 'configuration' section
          // https://giscus.app/
          repo: process.env.NEXT_PUBLIC_GISCUS_REPO,
          repositoryId: process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID,
          category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
          categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
          mapping: "pathname",
          // supported options: pathname, url, title
          reactions: "1",
          // Emoji reactions: 1 = enable / 0 = disable
          // Send discussion metadata periodically to the parent window: 1 = enable / 0 = disable
          metadata: "0",
          // theme example: light, dark, dark_dimmed, dark_high_contrast
          // transparent_dark, preferred_color_scheme, custom
          theme: "light",
          // theme when dark mode
          darkTheme: "transparent_dark",
          // If the theme option above is set to 'custom`
          // please provide a link below to your custom theme css file.
          // example: https://giscus.app/themes/custom_example.css
          themeURL: "",
          // This corresponds to the `data-lang="en"` in giscus's configurations
          lang: "en"
        }
      },
      search: {
        provider: "local",
        searchDocumentsPath: `${process.env.BASE_PATH || ""}/search.json`
      }
    };
    module.exports = siteMetadata2;
  }
});

// content-collections.ts
var import_siteMetadata = __toESM(require_siteMetadata());
import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";
import { imageSize } from "image-size";
import readingTime from "reading-time";
import { slug } from "github-slugger";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeCitation from "rehype-citation";
import rehypeKatex from "rehype-katex";
import rehypeKatexNoTranslate from "rehype-katex-notranslate";
import rehypePresetMinify from "rehype-preset-minify";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";
import remarkMath from "remark-math";
import { visit as visit2 } from "unist-util-visit";
import { z } from "zod";

// data/projectsData.ts
var projectsData = [
  {
    title: "A Search Engine",
    description: `What if you could look up any information in the world? Webpages, images, videos
    and more. Google has many features to help you find exactly what you're looking
    for.`,
    imgSrc: "/static/images/google.png",
    href: "https://www.google.com"
  },
  {
    title: "The Time Machine",
    description: `Imagine being able to travel back in time or to the future. Simple turn the knob
    to the desired date and press "Go". No more worrying about lost keys or
    forgotten headphones with this simple yet affordable solution.`,
    imgSrc: "/static/images/time-machine.jpg",
    href: "/blog/the-time-machine"
  }
];
var projectsData_default = projectsData;

// lib/content/index.ts
function coreContent(document) {
  const {
    content: _content,
    mdx: _mdx,
    _meta,
    ...core
  } = document;
  return core;
}

// lib/content/toc.ts
import GithubSlugger from "github-slugger";
import { remark } from "remark";
import { visit } from "unist-util-visit";
function nodeText(node) {
  if ("value" in node && typeof node.value === "string") return node.value;
  if ("alt" in node && typeof node.alt === "string") return node.alt;
  return "children" in node ? node.children.map(nodeText).join("") : "";
}
function remarkTocHeadings() {
  return (tree, file) => {
    const slugger = new GithubSlugger();
    const toc = [];
    visit(tree, "heading", (node) => {
      const value = nodeText(node);
      toc.push({ value, url: `#${slugger.slug(value)}`, depth: node.depth });
    });
    file.data.toc = toc;
  };
}
async function extractTocHeadings(markdown) {
  const file = await remark().use(remarkTocHeadings).process(markdown);
  return file.data.toc;
}

// content-collections.ts
var root = process.cwd();
var isProduction = process.env.NODE_ENV === "production";
var headingLinkIcon = fromHtmlIsomorphic(
  `<span class="content-header-link"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 linkicon"><path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z"/><path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z"/></svg></span>`,
  { fragment: true }
);
function remarkLocalImages() {
  return (tree) => {
    visit2(tree, "image", (node) => {
      if (!node.url?.startsWith("/")) return;
      const imagePath = path.join(root, "public", node.url);
      const dimensions = imageSize(readFileSync(imagePath));
      Object.assign(node, {
        type: "mdxJsxFlowElement",
        name: "Image",
        attributes: [
          { type: "mdxJsxAttribute", name: "alt", value: node.alt ?? "" },
          { type: "mdxJsxAttribute", name: "src", value: node.url },
          { type: "mdxJsxAttribute", name: "width", value: dimensions.width },
          { type: "mdxJsxAttribute", name: "height", value: dimensions.height }
        ]
      });
    });
  };
}
var mdxOptions = {
  cwd: root,
  remarkPlugins: [remarkGfm, remarkMath, remarkLocalImages, remarkAlert],
  rehypePlugins: [
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: "prepend",
        headingProperties: { className: ["content-header"] },
        content: headingLinkIcon
      }
    ],
    rehypeKatex,
    rehypeKatexNoTranslate,
    [rehypeCitation, { path: path.join(root, "data") }],
    [rehypePrettyCode, { defaultLang: "js", keepBackground: false }],
    rehypePresetMinify
  ]
};
function writeArtifacts(allBlogs) {
  const publishedBlogs = allBlogs.filter((post) => !isProduction || post.draft !== true);
  const tagCount = {};
  for (const post of publishedBlogs) {
    for (const tag of post.tags) {
      const formattedTag = slug(tag);
      tagCount[formattedTag] = (tagCount[formattedTag] ?? 0) + 1;
    }
  }
  const sortedTagCount = Object.fromEntries(
    Object.entries(tagCount).sort(([a], [b]) => a.localeCompare(b))
  );
  writeFileSync("app/tag-data.json", `${JSON.stringify(sortedTagCount, null, 2)}
`);
  if (import_siteMetadata.default.search?.provider === "local") {
    const searchDocumentsPath = import_siteMetadata.default.search.searchDocumentsPath;
    if (typeof searchDocumentsPath !== "string") return;
    const searchPath = path.basename(searchDocumentsPath);
    const postDocuments = publishedBlogs.sort((first, second) => Date.parse(second.date) - Date.parse(first.date)).map((post) => ({
      ...coreContent(post),
      id: post.path,
      href: `/${post.path}`,
      kind: "post"
    }));
    const projectDocuments = projectsData_default.map((project, index) => ({
      ...project,
      id: `project-${index}`,
      href: project.href ?? "/projects",
      kind: "project"
    }));
    writeFileSync(`public/${searchPath}`, JSON.stringify([...postDocuments, ...projectDocuments]));
  }
}
var dateSchema = z.coerce.date().transform((value) => value.toISOString());
var blogs = defineCollection({
  name: "blogs",
  typeName: "Blog",
  directory: "data/blog",
  include: "**/*.mdx",
  schema: z.object({
    content: z.string(),
    title: z.string(),
    date: dateSchema,
    tags: z.array(z.string()).default([]),
    lastmod: dateSchema.optional(),
    draft: z.boolean().optional(),
    summary: z.string().optional(),
    images: z.union([z.string(), z.array(z.string())]).optional(),
    authors: z.array(z.string()).optional(),
    layout: z.string().optional(),
    bibliography: z.string().optional(),
    canonicalUrl: z.string().optional()
  }),
  transform: async (document, context) => {
    const slugPath = document._meta.path;
    const mdx = await compileMDX(context, document, mdxOptions);
    const reading = readingTime(document.content);
    return {
      ...document,
      mdx,
      readingTime: {
        text: reading.text,
        minutes: reading.minutes,
        time: reading.time,
        words: reading.words
      },
      slug: slugPath,
      path: `blog/${slugPath}`,
      filePath: path.posix.join("blog", document._meta.filePath.replaceAll("\\", "/")),
      toc: await extractTocHeadings(document.content),
      structuredData: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: document.title,
        datePublished: document.date,
        dateModified: document.lastmod ?? document.date,
        description: document.summary,
        image: document.images?.[0] ?? import_siteMetadata.default.socialBanner,
        url: `${import_siteMetadata.default.siteUrl}/blog/${slugPath}`
      }
    };
  },
  onSuccess: writeArtifacts
});
var authors = defineCollection({
  name: "authors",
  typeName: "Authors",
  directory: "data/authors",
  include: "**/*.mdx",
  schema: z.object({
    content: z.string(),
    name: z.string(),
    avatar: z.string().optional(),
    occupation: z.string().optional(),
    company: z.string().optional(),
    email: z.string().optional(),
    twitter: z.string().optional(),
    bluesky: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    layout: z.string().optional()
  }),
  transform: async (document, context) => ({
    ...document,
    mdx: await compileMDX(context, document, mdxOptions),
    slug: document._meta.path,
    path: `authors/${document._meta.path}`,
    filePath: path.posix.join("authors", document._meta.filePath.replaceAll("\\", "/")),
    toc: await extractTocHeadings(document.content)
  })
});
var content_collections_default = defineConfig({ content: [blogs, authors] });
export {
  content_collections_default as default
};
