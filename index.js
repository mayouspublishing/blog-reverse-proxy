addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // Extract path after /blog
  let proxyPath = url.pathname.replace(/^\/blog\/?/, '/')
  if (proxyPath === '') proxyPath = '/'

  // Rebuild target URL to blog.mayous.org
  const targetUrl = `https://blog.mayous.org${proxyPath}`

  const modifiedHeaders = new Headers()
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'user-agent') {
      modifiedHeaders.set(key, value)
    }
  })

  // Use desktop UA to avoid ?m=1 redirect
  modifiedHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133 Safari/537.36')

  const response = await fetch(targetUrl, {
    method: request.method,
    headers: modifiedHeaders,
    redirect: 'follow'
  })

  const contentType = response.headers.get("Content-Type") || ""

  if (contentType.includes("text/html")) {
    let html = await response.text()

    // Remove ?m=1 from internal Blogger links
    html = html.replace(/\?m=1/g, '')

    // Fix canonical tag to use your proxied URL
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

