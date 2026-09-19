import configuration from "../../content-collections.ts";
import { GetTypeByName } from "@content-collections/core";

export type Blog = GetTypeByName<typeof configuration, "blogs">;
export declare const allBlogs: Array<Blog>;

export type ProjectCaseStudy = GetTypeByName<typeof configuration, "projectCaseStudies">;
export declare const allProjectCaseStudies: Array<ProjectCaseStudy>;

export {};
