import { z, defineCollection } from 'astro:content';

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    category: z.enum(['AEROSPACE', 'REVERSE-ENG', 'CTF-WRITEUP', 'POST-QUANTUM', 'CYBERSECURITY']),
    readTime: z.string(),
    classification: z.enum(['TOP-SECRET', 'RESTRICTED', 'UNCLASSIFIED']),
    tags: z.array(z.string()),
    summary: z.string(),
  }),
});

export const collections = {
  'posts': postsCollection,
};
