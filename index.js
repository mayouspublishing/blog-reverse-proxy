addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  let proxyPath = url.pathname.replace(/^\/blog\/?/, '/')
  if (proxyPath === '') proxyPath = '/'

  const targetUrl = `https://blog.mayous.org${proxyPath}`

  const modifiedHeaders = new Headers()
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'user-agent') {
      modifiedHeaders.set(key, value)
    }
  })
  modifiedHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133 Safari/537.36')

  const response = await fetch(targetUrl, {
    method: request.method,
    headers: modifiedHeaders,
    redirect: 'follow'
  })

  const contentType = response.headers.get("Content-Type") || ""

  if (contentType.includes("text/html")) {
    let html = await response.text()

    // 1. Remove "?m=1" from URLs
    html = html.replace(/\?m=1/g, '')

    // 2. Rewrite internal links to use mayous.org/blog
    html = html.replace(/https:\/\/blog\.mayous\.org(\/[^\s"'<>]*)/g, 'https://www.mayous.org/blog$1')

    // 3. Rewrite canonical tag to proxied domain
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

