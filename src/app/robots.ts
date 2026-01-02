import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://nvntory-mgm.vercel.app' // Update this if you have a custom domain

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/settings/', '/api/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
