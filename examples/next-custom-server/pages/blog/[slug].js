import { useRouter } from 'next/router'
import Navbar from '../navbar'
import blogs from '../../blogs'

export default function Blog() {
  const router = useRouter()
  const { slug } = router.query
  const postData = blogs.filter((blog) => blog.slug === slug)

  return (
    <div style={{ maxWidth: `960px`, margin: `0 auto` }}>
      <Navbar />
      <h1>{postData[0] !== undefined ? postData[0].title : ' '}</h1>
      <p>{postData[0] !== undefined ? postData[0].desc : ' '}</p>
    </div>
  )
}
