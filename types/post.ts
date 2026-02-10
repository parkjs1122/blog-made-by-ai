import React from "react"

/**
 * Post frontmatter metadata
 * Parsed from YAML frontmatter in MDX files
 */
export interface PostFrontmatter {
  /** Post title */
  title: string
  /** Publication date in YYYY-MM-DD format */
  date: string
  /** Short excerpt/summary of the post */
  excerpt: string
  /** Author name (optional) */
  author?: string
  /** Array of tags/categories */
  tags: string[]
  /** Whether this post is featured */
  featured?: boolean
  /** Path to featured image */
  image?: string
  /** Whether this is a draft (hidden in production) */
  draft?: boolean
}

/**
 * Complete post object with metadata and content
 */
export interface Post {
  /** URL-friendly slug (filename without extension) */
  slug: string
  /** Parsed frontmatter metadata */
  frontmatter: PostFrontmatter
  /** Raw markdown content (without frontmatter) */
  content: string
  /** Estimated reading time in minutes */
  readingTime: number
}

/**
 * Search result with match information
 */
export interface SearchResult {
  /** The matching post */
  post: Post
  /** Array of match details */
  matches: Array<{
    /** Field that matched (title, excerpt, content) */
    key: string
    /** The matched text value */
    value: string
    /** Array of [start, end] indices for highlighting */
    indices: [number, number][]
  }>
  /** Relevance score (lower is better) */
  score: number
}

/**
 * Heading extracted from markdown content
 * Used for table of contents generation
 */
export interface Heading {
  /** Heading level (2 for h2, 3 for h3, etc.) */
  level: number
  /** Heading text content */
  text: string
  /** URL-friendly slug for anchor links */
  slug: string
}

/**
 * Custom MDX components mapping
 * Used to override default HTML elements with custom React components
 */
export type MDXComponents = {
  [key: string]: React.ComponentType<any>
}

/**
 * Compiled MDX result
 */
export interface MDXCompileResult {
  /** Rendered React content */
  content: React.ReactElement
  /** Parsed frontmatter */
  frontmatter: PostFrontmatter
  /** Extracted headings for TOC */
  headings: Heading[]
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  /** Current page number (1-indexed) */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Total number of posts */
  totalPosts: number
  /** Number of posts per page */
  postsPerPage: number
  /** Whether there is a previous page */
  hasPrevPage: boolean
  /** Whether there is a next page */
  hasNextPage: boolean
}
