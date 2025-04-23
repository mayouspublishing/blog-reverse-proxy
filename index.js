addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // Extract path after /blog
 // const proxyPath = url.pathname.replace(/^\/blog/, '')
  const proxyPath = url.pathname.replace(/^\/blog\/?/, '/')


  // Construct target Blogger URL (updated to default blogspot domain)
  const targetUrl = `https://mayouspublishing.blogspot.com${proxyPath}`

  // Clone original headers to override User-Agent
  const modifiedHeaders = new Headers()
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'user-agent') {
      modifiedHeaders.set(key, value)
    }
  })
  modifiedHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133 Safari/537.36')

  // Send modified request
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: modifiedHeaders,
    redirect: 'follow'
  })

  const contentType = response.headers.get("Content-Type") || ""

  if (contentType.includes("text/html")) {
    let html = await response.text()

    // Remove Blogger's mobile redirect script if present
    html = html.replace(/<script.*?b:if.*?data:blog.isMobile.*?<\/script>/gs, '')

    // Fix canonical tag to match proxied domain
    html = html.replace(
      /<link rel="canonical".*?>/,
      `<link rel="canonical" href="${url.origin + url.pathname}"/>`
    )

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=UTF-8' },
      status: 200
    })
  }

  return response
}
