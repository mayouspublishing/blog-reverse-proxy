addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // Extract path after /blog
  const proxyPath = url.pathname.replace(/^\/blog/, '')

  // Construct target Blogger URL
  const targetUrl = `https://blog.mayous.org${proxyPath}`

  const response = await fetch(targetUrl)
  const contentType = response.headers.get("Content-Type") || ""

  // If it's HTML, rewrite it
  if (contentType.includes("text/html")) {
    let html = await response.text()

    // Remove mobile redirect logic
    html = html.replace(/<script.*?b:if.*?data:blog.isMobile.*?<\/script>/gs, '')

    // Rewrite canonical tag to match reverse proxy path
    html = html.replace(
      /<link rel="canonical".*?>/,
      `<link rel="canonical" href="${url.origin + url.pathname}"/>`
    )

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=UTF-8' },
      status: 200
    })
  }

  // Serve all non-HTML assets (CSS, images, etc.) directly
  return response
}
