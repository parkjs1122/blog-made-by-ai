import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getAllPosts, getPostBySlug } from "@/lib/posts"
import { extractHeadings } from "@/lib/mdx"
import { PostContent } from "@/components/blog/post-content"
import { PostMeta } from "@/components/blog/post-meta"
import { ResponsiveToc } from "@/components/blog/responsive-toc"
import { PostActions } from "@/components/blog/post-actions"
import { Separator } from "@/components/ui/separator"

interface PostPageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const postUrl = `${baseUrl}/posts/${params.slug}`
  const imageUrl = post.frontmatter.image
    ? post.frontmatter.image.startsWith("http")
      ? post.frontmatter.image
      : `${baseUrl}${post.frontmatter.image}`
    : `${baseUrl}/og-default.png`

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.excerpt,
    authors: post.frontmatter.author
      ? [{ name: post.frontmatter.author }]
      : undefined,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.excerpt,
      type: "article",
      url: postUrl,
      publishedTime: post.frontmatter.date,
      authors: post.frontmatter.author ? [post.frontmatter.author] : undefined,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.frontmatter.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontmatter.title,
      description: post.frontmatter.excerpt,
      images: [imageUrl],
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const headings = extractHeadings(post.content)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const postUrl = `${baseUrl}/posts/${params.slug}`
  const imageUrl = post.frontmatter.image
    ? post.frontmatter.image.startsWith("http")
      ? post.frontmatter.image
      : `${baseUrl}${post.frontmatter.image}`
    : undefined

  // JSON-LD structured data for Article
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.frontmatter.title,
    description: post.frontmatter.excerpt,
    image: imageUrl,
    datePublished: post.frontmatter.date,
    dateModified: post.frontmatter.date,
    author: {
      "@type": "Person",
      name: post.frontmatter.author || "Anonymous",
    },
    publisher: {
      "@type": "Organization",
      name: "shadcn Blog",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    url: postUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    keywords: post.frontmatter.tags.join(", "),
  }

  return (
    <div className="container py-10">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-4xl mx-auto">
        {/* Post Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {post.frontmatter.title}
          </h1>
          <PostMeta
            date={post.frontmatter.date}
            readingTime={post.readingTime}
            tags={post.frontmatter.tags}
            author={post.frontmatter.author}
          />
        </header>

        <Separator className="mb-8" />

        {/* Tablet: Collapsible TOC (md to lg) */}
        {headings.length > 0 && (
          <div className="hidden md:block xl:hidden mb-8">
            <ResponsiveToc headings={headings} variant="collapsible" />
          </div>
        )}

        {/* Content with TOC */}
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <PostContent source={post.content} />
          </div>

          {/* Desktop: Sticky TOC Sidebar (xl+) */}
          {headings.length > 0 && (
            <aside className="hidden xl:block w-64 shrink-0">
              <div className="sticky top-20">
                <ResponsiveToc headings={headings} variant="sidebar" />
              </div>
            </aside>
          )}
        </div>

        {/* Admin Actions */}
        <PostActions slug={params.slug} />
      </article>
    </div>
  )
}
