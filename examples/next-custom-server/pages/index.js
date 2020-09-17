import Navbar from './navbar'
import { useEffect } from 'react'

export default function Home() {
  return (
    <div style={{ maxWidth: `960px`, margin: `0 auto` }}>
      <Navbar />
      <h1>Main page</h1>
    </div>
  )
}
