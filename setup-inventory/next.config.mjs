/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Imagens sao renderizadas via <img> (URLs externas arbitrarias e Base64),
    // portanto a otimizacao do next/image nao e utilizada.
    unoptimized: true,
  },
};

export default nextConfig;
