"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { createSearchIndex } from "@/lib/search"
import { SearchBar } from "@/components/blog/search-bar"
import { SearchResults } from "@/components/blog/search-results"
import { PostList } from "@/components/blog/post-list"
import type { Post, SearchResult } from "@/types/post"

interface SearchClientProps {
  posts: Post[]
}

export function SearchClient({ posts }: SearchClientProps) {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [searchEngine] = React.useState(() => createSearchIndex(posts))
  const [query, setQuery] = React.useState(initialQuery)
  const [results, setResults] = React.useState<SearchResult[]>(() => {
    if (initialQuery) {
      return createSearchIndex(posts).search(initialQuery)
    }
    return []
  })

  const handleSearch = React.useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery)

      if (!searchQuery || searchQuery.trim().length < 2) {
        setResults([])
        return
      }

      const searchResults = searchEngine.search(searchQuery)
      setResults(searchResults)
    },
    [searchEngine]
  )

  return (
    <>
      <SearchBar
        onSearch={handleSearch}
        placeholder="Search posts... (⌘K)"
        className="mb-8"
      />

      {query && query.trim().length >= 2 ? (
        <SearchResults results={results} query={query} />
      ) : (
        <div className="space-y-8">
          <p className="text-muted-foreground">
            Try searching for topics like &quot;Next.js&quot;, &quot;React&quot;, or &quot;TypeScript&quot;
          </p>
          <div>
            <h2 className="text-2xl font-bold mb-4">All Posts</h2>
            <PostList posts={posts} showFeatured={false} />
          </div>
        </div>
      )}
    </>
  )
}
