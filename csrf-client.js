(function () {
  const originalFetch = window.fetch.bind(window);
  let csrfTokenPromise = null;

  function isSameOrigin(url) {
    const target = new URL(url, window.location.origin);
    return target.origin === window.location.origin;
  }

  function isMutating(method) {
    return !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
  }

  function getCsrfToken(forceRefresh) {
    if (forceRefresh) csrfTokenPromise = null;
    if (!csrfTokenPromise) {
      csrfTokenPromise = originalFetch('/api/csrf-token', { credentials: 'same-origin', cache: 'no-store' })
        .then(res => res.json())
        .then(data => data.csrfToken);
    }
    return csrfTokenPromise;
  }

  window.getCsrfToken = getCsrfToken;

  window.fetch = async function (input, init) {
    const request = input instanceof Request ? input : null;
    const url = request ? request.url : input;
    const options = init ? { ...init } : {};
    const method = options.method || (request && request.method) || 'GET';

    if (url && isSameOrigin(url) && isMutating(method)) {
      const headers = new Headers(options.headers || (request && request.headers) || {});
      if (!headers.has('x-csrf-token')) {
        headers.set('x-csrf-token', await getCsrfToken(false));
      }
      options.headers = headers;
      options.credentials = options.credentials || 'same-origin';
    }

    return originalFetch(input, options);
  };
})();
