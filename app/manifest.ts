import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LPU Find',
    short_name: 'LPU Find',
    description: 'AI-powered community lost and found match engine. Every item found. Every report resolved.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF8F3',
    theme_color: '#C96442',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
