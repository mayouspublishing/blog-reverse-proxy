addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // Redirect /blog and /blog/ to blog.mayous.org/
  if (url.pathname === '/blog' || url.pathname === '/blog/') {
    return Response.redirect('https://blog.mayous.org/', 301)
  }

  // Redirect /blog/* to blog.mayous.org/*
  if (url.pathname.startsWith('/blog/')) {
    const targetPath = url.pathname.replace('/blog/', '/')
    const targetUrl = `https://blog.mayous.org${targetPath}${url.search}`
    return Response.redirect(targetUrl, 301)
  }

  // For everything else, serve normally
  return fetch(request)
}
