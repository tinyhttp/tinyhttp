import Navbar from './navbar'

export default function About() {
  return (
    <div style={{ maxWidth: `960px`, margin: `0 auto` }}>
      <Navbar />
      <h3>
        Nice, you've arrived on about page.
        <br />
        This is an example of tinyhttp used for nextjs custom server. Awesome isn't it?
      </h3>
    </div>
  )
}
