addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // Only redirect paths that start with /blog/
  if (url.pathname.startsWith('/blog/')) {
    const targetPath = url.pathname.replace(/^\/blog\/?/, '/')
    const targetUrl = `https://blog.mayous.org${targetPath}${url.search}`

    return Response.redirect(targetUrl, 301)
  }

  // If not matching /blog/, just fetch original
  return fetch(request)
}
