import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const BASE = "https://zilverse.com";

  const staticRoutes = [
    { url: `${BASE}/`, priority: 1.0 },
    { url: `${BASE}/freelancers`, priority: 0.9 },
    { url: `${BASE}/projects`, priority: 0.9 },
    { url: `${BASE}/services`, priority: 0.9 },
    { url: `${BASE}/jobs`, priority: 0.9 },
    { url: `${BASE}/community`, priority: 0.8 },
    { url: `${BASE}/reels`, priority: 0.8 },
    { url: `${BASE}/discussions`, priority: 0.8 },
    { url: `${BASE}/exchange`, priority: 0.8 },
    { url: `${BASE}/events`, priority: 0.7 },
    { url: `${BASE}/academy`, priority: 0.7 },
    { url: `${BASE}/fund`, priority: 0.7 },
    { url: `${BASE}/internships`, priority: 0.7 },
    { url: `${BASE}/research`, priority: 0.6 },
    { url: `${BASE}/creators`, priority: 0.6 },
    { url: `${BASE}/certifications`, priority: 0.6 },
    { url: `${BASE}/innovation`, priority: 0.6 },
    { url: `${BASE}/about`, priority: 0.5 },
    { url: `${BASE}/contact`, priority: 0.5 },
    { url: `${BASE}/careers`, priority: 0.5 },
    { url: `${BASE}/press`, priority: 0.4 },
    { url: `${BASE}/privacy`, priority: 0.3 },
    { url: `${BASE}/terms`, priority: 0.3 },
  ];

  return staticRoutes.map((route) => ({
    url: route.url,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route.priority,
  }));
}
