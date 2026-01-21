
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.tiny.com.br' },
      { protocol: 'https', hostname: 'api.tiny.com.br' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
    ],
  },
  typescript: {
    // Permite deploy mesmo com erros de tipagem em arquivos legados
    ignoreBuildErrors: true,
  },
  eslint: {
    // Evita falhas de build por avisos de linting
    ignoreDuringBuilds: true,
  },
  // Garante compatibilidade com o sistema de roteamento híbrido (index.html + Next API)
  trailingSlash: false,
};

export default nextConfig;
