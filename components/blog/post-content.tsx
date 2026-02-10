import { MDXRemote } from "next-mdx-remote/rsc"
import Image from "next/image"
import Link from "next/link"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeShiki from "@shikijs/rehype"

interface PostContentProps {
  source: string
}

// Custom MDX components
const components = {
  // Override default image with Next.js Image
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const { src, alt } = props
    if (!src) return null

    // Determine if image is remote or local
    const isRemote = src.startsWith('http')

    return (
      <span className="block my-8">
        <Image
          src={src}
          alt={alt || ""}
          width={800}
          height={400}
          className="rounded-lg"
          loading="lazy"
          placeholder={isRemote ? "blur" : "empty"}
          blurDataURL={isRemote ? "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg==" : undefined}
        />
      </span>
    )
  },
  // Custom link component
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const { href, children } = props
    if (!href) return <>{children}</>

    // External links
    if (href.startsWith("http")) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-4 hover:text-primary/80"
        >
          {children}
        </a>
      )
    }

    // Internal links
    return (
      <Link
        href={href}
        className="text-primary underline underline-offset-4 hover:text-primary/80"
      >
        {children}
      </Link>
    )
  },
  // Custom code block with copy button
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => {
    return (
      <div className="relative group">
        <pre {...props} className="overflow-x-auto rounded-lg border bg-muted p-4">
          {props.children}
        </pre>
      </div>
    )
  },
  // Table wrapper for responsiveness
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => {
    return (
      <div className="my-6 overflow-x-auto">
        <table className="w-full border-collapse" {...props} />
      </div>
    )
  },
}

export async function PostContent({ source }: PostContentProps) {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <MDXRemote
        source={source}
        options={{
          parseFrontmatter: false,
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [
                rehypeAutolinkHeadings,
                {
                  behavior: "wrap",
                  properties: {
                    className: ["anchor"],
                  },
                },
              ],
              [
                rehypeShiki,
                {
                  themes: {
                    light: "github-light",
                    dark: "github-dark",
                  },
                },
              ],
            ],
          },
        }}
        components={components}
      />
    </article>
  )
}
