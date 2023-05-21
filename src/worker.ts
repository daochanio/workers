import { Router, IRequest } from 'itty-router';

const router = Router();

router.get('/proxy', proxy);

async function proxy(request: IRequest) {
  const url = new URL(request.url);

  const proxy = url.searchParams.get('url');

  if (!proxy) {
    return new Response('Bad request: missing url query param', { status: 400 });
  }

  const proxyUrl = new URL(proxy);

  if (proxyUrl.protocol != 'https:') {
    return new Response('Bad request: url must use https', { status: 400 });
  }

  // re-entry protection
  if (proxyUrl.hostname === url.hostname || proxyUrl.hostname === 'api.daochan.io') {
    return new Response('Bad request: re-entry protection', { status: 400 });
  }

  return fetch(proxyUrl, {
    method: 'GET',
    redirect: 'manual',
    headers: {
      'User-Agent': 'Cloudflare Worker',
    },
  });
}

export default {
  fetch: router.handle,
};
