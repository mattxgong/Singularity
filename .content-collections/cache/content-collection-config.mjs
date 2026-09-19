// content-collections.ts
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

// data/profile.ts
var profile = {
  name: "Matthew Gong",
  email: "matthewxgong@gmail.com",
  location: "Waterloo, Ontario, Canada",
  status: "Computing and Financial Management student and Technical Analyst",
  positioning: "I build multi-agent systems and applied machine learning tools for complex technical workflows.",
  biography: [
    "I study Computing and Financial Management at the University of Waterloo, combining software engineering, machine learning, and financial analysis.",
    "My work spans multi-agent developer workflows, applied data analysis, computer vision, and autonomous robotics."
  ]
};
var profile_default = profile;

// data/types.ts
var ISO_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
var SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function assertIsoMonth(value, field) {
  if (!ISO_MONTH_PATTERN.test(value)) {
    throw new Error(`${field} must use the ISO YYYY-MM format`);
  }
}
function validateProjects(projects2) {
  const slugs = /* @__PURE__ */ new Set();
  for (const project of projects2) {
    if (!SLUG_PATTERN.test(project.slug)) {
      throw new Error(`Project slug "${project.slug}" must be lowercase and hyphenated`);
    }
    if (slugs.has(project.slug)) {
      throw new Error(`Duplicate project slug: ${project.slug}`);
    }
    slugs.add(project.slug);
    assertIsoMonth(project.period.start, `${project.slug}.period.start`);
    if (project.period.end) {
      assertIsoMonth(project.period.end, `${project.slug}.period.end`);
    }
    if (project.cover && (!project.cover.alt.trim() || project.cover.width <= 0 || project.cover.height <= 0)) {
      throw new Error(`Project cover for "${project.slug}" requires alt text and dimensions`);
    }
  }
}
function validateProjectCaseStudies(projects2, caseStudySlugs) {
  const availableCaseStudies = new Set(caseStudySlugs);
  const caseStudyReferences = projects2.flatMap(
    (project) => project.caseStudy ? [project.caseStudy] : []
  );
  const referencedCaseStudies = new Set(caseStudyReferences);
  if (availableCaseStudies.size !== caseStudySlugs.length) {
    const duplicate = caseStudySlugs.find((slug2, index) => caseStudySlugs.indexOf(slug2) !== index);
    throw new Error(`Duplicate case study document: ${duplicate}`);
  }
  if (referencedCaseStudies.size !== caseStudyReferences.length) {
    const duplicate = caseStudyReferences.find(
      (slug2, index) => caseStudyReferences.indexOf(slug2) !== index
    );
    throw new Error(`Case study referenced by multiple projects: ${duplicate}`);
  }
  for (const slug2 of referencedCaseStudies) {
    if (!availableCaseStudies.has(slug2)) {
      throw new Error(`Missing case study: ${slug2}`);
    }
  }
  for (const slug2 of availableCaseStudies) {
    if (!referencedCaseStudies.has(slug2)) {
      throw new Error(`Orphan case study: ${slug2}`);
    }
  }
}

// data/projects.ts
var projects = [
  {
    slug: "solomon-chess-engine",
    title: "Solomon: Chess Engine",
    tagline: "A high-performance C++ chess engine with NNUE position evaluation.",
    role: "Chess engine developer",
    period: { start: "2025-01" },
    status: "active",
    stack: ["C++", "Bitboards", "Alpha-Beta Search", "NNUE"],
    outcome: "Implemented incremental neural evaluation and optimized search while maintaining real-time play.",
    featured: false,
    order: 2,
    links: []
  },
  {
    slug: "robotics-challenge",
    title: "Robotics Challenge",
    tagline: "Computer vision and autonomous navigation for a humanoid robot.",
    role: "Computer vision and autonomous navigation developer",
    period: { start: "2025-07", end: "2025-08" },
    status: "competition",
    stack: ["Python", "ROS", "YOLO", "Computer Vision"],
    outcome: "Won third place among hundreds of university teams across China.",
    featured: true,
    order: 1,
    links: [],
    caseStudy: "robotics-challenge"
  },
  {
    slug: "ros-mobile-controller",
    title: "ROS Mobile Controller",
    tagline: "Remote iOS control and real-time SLAM mapping for a ROS robot.",
    role: "iOS, controls, and mapping developer",
    period: { start: "2023-09", end: "2024-04" },
    status: "archived",
    stack: ["C++", "ROS", "Swift", "iOS", "SLAM"],
    outcome: "Delivered stable remote control and real-time spatial mapping on iOS.",
    featured: false,
    order: 3,
    links: []
  }
];
validateProjects(projects);
var projects_default = projects;

// data/skills.ts
var skillGroups = [
  {
    label: "Programming languages",
    skills: [
      "Python",
      "C++",
      "SQL",
      "JavaScript",
      "TypeScript",
      "Java",
      "Swift",
      "CSS",
      "HTML",
      "C",
      "R"
    ].map((name) => ({ name, primary: ["Python", "C++", "TypeScript", "SQL"].includes(name) }))
  },
  {
    label: "Libraries and frameworks",
    skills: [
      "PyTorch",
      "Google Agent Development Kit",
      "multi-agent systems",
      "Hugging Face",
      "TensorFlow",
      "Node.js",
      "Puppeteer",
      "React",
      "pandas"
    ].map((name) => ({
      name,
      primary: ["PyTorch", "Google Agent Development Kit", "multi-agent systems", "React"].includes(
        name
      )
    }))
  },
  {
    label: "Tools and platforms",
    skills: [
      "Git",
      "Linux",
      "ROS",
      "Google AI Studio",
      "iOS",
      "Power BI",
      "Power Apps",
      "Power Automate",
      "AWS",
      "Docker",
      "SAP",
      "Anaconda",
      "Jupyter",
      ".NET",
      "Xcode",
      "Unity"
    ].map((name) => ({ name, primary: ["Git", "Linux", "ROS", "Docker"].includes(name) }))
  }
];

// data/site.ts
var basePath = process.env.BASE_PATH || "";
var siteMetadata = {
  title: "Singularity",
  author: "Matthew Gong",
  headerTitle: "Singularity",
  description: "Matthew Gong's personal portfolio and technical blog",
  language: "en-us",
  locale: "en-US",
  theme: "system",
  siteUrl: "https://mattxgong-singularity.vercel.app",
  siteRepo: "https://github.com/mattxgong/Singularity",
  siteLogo: `${basePath}/static/images/logo.png`,
  socialBanner: `${basePath}/static/images/twitter-card.png`,
  email: profile_default.email,
  github: "https://github.com/mattxgong/Singularity",
  linkedin: "https://ca.linkedin.com/in/matthew-x-gong",
  stickyNav: false,
  analytics: {
    umamiAnalytics: {
      umamiWebsiteId: process.env.NEXT_UMAMI_ID
    }
  },
  comments: {
    provider: "giscus",
    giscusConfig: {
      repo: process.env.NEXT_PUBLIC_GISCUS_REPO,
      repositoryId: process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID,
      category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
      categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
      mapping: "pathname",
      reactions: "1",
      metadata: "0",
      theme: "light",
      darkTheme: "transparent_dark",
      themeURL: "",
      lang: "en"
    }
  },
  search: {
    provider: "local",
    searchDocumentsPath: `${basePath}/search.json`
  }
};
var site_default = siteMetadata;

// data/social.ts
var socialLinks = [
  { kind: "mail", href: `mailto:${site_default.email}`, label: "Email Matthew Gong" },
  { kind: "github", href: site_default.github, label: "Singularity on GitHub" },
  { kind: "linkedin", href: site_default.linkedin, label: "Matthew Gong on LinkedIn" }
];

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
  if (site_default.search?.provider === "local") {
    const searchDocumentsPath = site_default.search.searchDocumentsPath;
    if (typeof searchDocumentsPath !== "string") return;
    const searchPath = path.basename(searchDocumentsPath);
    const postDocuments = publishedBlogs.sort((first, second) => Date.parse(second.date) - Date.parse(first.date)).map((post) => ({
      ...coreContent(post),
      id: post.path,
      href: `/${post.path}`,
      kind: "post"
    }));
    const projectDocuments = projects_default.map((project) => ({
      id: `project-${project.slug}`,
      title: project.title,
      summary: `${project.tagline} ${project.outcome}`,
      href: project.links[0]?.href ?? "/projects",
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
        image: document.images?.[0] ?? site_default.socialBanner,
        url: `${site_default.siteUrl}/blog/${slugPath}`
      }
    };
  },
  onSuccess: writeArtifacts
});
var projectCaseStudies = defineCollection({
  name: "projectCaseStudies",
  typeName: "ProjectCaseStudy",
  directory: "data/projects",
  include: "**/*.mdx",
  schema: z.object({
    content: z.string()
  }),
  transform: async (document, context) => {
    const slugPath = document._meta.path;
    const reading = readingTime(document.content);
    return {
      ...document,
      mdx: await compileMDX(context, document, mdxOptions),
      readingTime: {
        text: reading.text,
        minutes: reading.minutes,
        time: reading.time,
        words: reading.words
      },
      slug: slugPath,
      path: `projects/${slugPath}`,
      filePath: path.posix.join("projects", document._meta.filePath.replaceAll("\\", "/")),
      toc: await extractTocHeadings(document.content)
    };
  },
  onSuccess: (documents) => validateProjectCaseStudies(
    projects_default,
    documents.map((document) => document.slug)
  )
});
var content_collections_default = defineConfig({ content: [blogs, projectCaseStudies] });
export {
  content_collections_default as default
};
