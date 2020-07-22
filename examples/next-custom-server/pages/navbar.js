import Link from 'next/link'
import blogs from '../blogs'

export default function Navbar() {
  return (
    <nav style={{ maxWidth: `960px`, margin: `0 auto` }}>
      <ul>
        <li>
          <Link href="/">
            <a style={{ textDecoration: 'none' }}>
              <h2>Main</h2>
            </a>
          </Link>
        </li>
        <li>
          <Link href="/about">
            <a style={{ textDecoration: 'none' }}>
              <h2>About</h2>
            </a>
          </Link>
        </li>
        <hr />
        <h2>List of posts</h2>
        {blogs.map((blog, index) => (
          <li key={index}>
            <Link href="/blog/[slug]" as={`/blog/${blog.slug}`}>
              <a style={{ fontSize: `1.25rem`, textDecoration: 'none' }}>{blog.title}</a>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
