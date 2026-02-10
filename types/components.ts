import { Post, SearchResult, Heading } from "./post"

/**
 * Props for PostCard component
 */
export interface PostCardProps {
  /** Post data to display */
  post: Post
  /** Whether to show as featured (larger card) */
  featured?: boolean
}

/**
 * Props for PostList component
 */
export interface PostListProps {
  /** Array of posts to display */
  posts: Post[]
  /** Whether to show featured post at top */
  showFeatured?: boolean
  /** Optional pagination metadata */
  pagination?: {
    currentPage: number
    totalPages: number
  }
}

/**
 * Props for PostContent component
 */
export interface PostContentProps {
  /** MDX source string */
  source: string
  /** Optional custom MDX components */
  components?: Record<string, React.ComponentType<any>>
}

/**
 * Props for TableOfContents component
 */
export interface TableOfContentsProps {
  /** Array of headings */
  headings: Heading[]
  /** Currently active heading slug */
  activeId?: string
}

/**
 * Props for SearchBar component
 */
export interface SearchBarProps {
  /** Callback when search results are ready */
  onSearch: (results: SearchResult[]) => void
  /** Placeholder text for search input */
  placeholder?: string
  /** Initial search query */
  initialQuery?: string
}

/**
 * Props for MarkdownEditor component
 */
export interface MarkdownEditorProps {
  /** Initial content for the editor */
  initialContent?: string
  /** Callback when content is saved */
  onSave: (content: string, frontmatter: any) => void | Promise<void>
}

/**
 * Props for ThemeToggle component
 */
export interface ThemeToggleProps {
  /** Optional className for styling */
  className?: string
}

/**
 * Props for PostMeta component (date, reading time, tags)
 */
export interface PostMetaProps {
  /** Post publication date */
  date: string
  /** Reading time in minutes */
  readingTime: number
  /** Optional array of tags */
  tags?: string[]
  /** Optional author name */
  author?: string
}
