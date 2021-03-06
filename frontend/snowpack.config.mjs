export default {
  optimize: {
    // entrypoints: 'auto',
    bundle: true,
    minify: true,
    target: 'es2018',
  },
  mount: {
    src: { url: '/!/dist' },
    public: {url: '/', static: true},
  },
  buildOptions: {
    out: 'dist',
    baseUrl: 'https://games.oclyke.dev/call-late',
  },
  env: {
    API_VER: 'v0',
  },
  routes: [
    {match: 'routes', src: '.*', dest: '/index.html'} // fallback route for SPA https://www.snowpack.dev/guides/routing
  ]
};
