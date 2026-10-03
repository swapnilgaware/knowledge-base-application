import { defineConfig } from 'vite';

const proxy = {
  // Expose only the application realm and login assets, never the admin API.
  '/auth/realms/knowledge-base': 'http://127.0.0.1:8180',
  '/auth/resources': 'http://127.0.0.1:8180',
  '/api': 'http://127.0.0.1:8080',
  '/oauth2': 'http://127.0.0.1:8080',
  '/login/oauth2': 'http://127.0.0.1:8080',
};
export default defineConfig({ server: { proxy }, preview: { proxy } });
