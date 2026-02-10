import type { Metadata } from "next"
import localFont from "next/font/local"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { AdminHeader } from "@/components/admin/admin-header"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import "./globals.css"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "My Blog",
    template: "%s | My Blog",
  },
  description: "A modern blog built with Next.js and shadcn/ui",
  keywords: ["Next.js", "React", "TypeScript", "shadcn/ui", "Blog"],
  authors: [{ name: "Blog Author" }],
  creator: "Blog Author",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: "My Blog",
    description: "A modern blog built with Next.js and shadcn/ui",
    siteName: "My Blog",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "My Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "My Blog",
    description: "A modern blog built with Next.js and shadcn/ui",
    images: ["/og-default.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
              <AdminHeader />
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
