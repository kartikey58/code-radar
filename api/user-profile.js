import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req, res) {
  const email = req.headers['x-user-email'];

  if (!email) {
    return res.status(401).json({ error: 'Unauthorized: No email provided' });
  }

  if (req.method === 'GET') {
    try {
      const userProfile = await prisma.userProfile.findUnique({
        where: { email },
      });
      return res.status(200).json(userProfile || {});
    } catch (error) {
      console.error("GET user-profile error:", error);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  }

  if (req.method === 'POST') {
    try {
      // Helper to parse request body stream in Node.js raw serverless environment
      const getRawBody = async (readable) => {
        const chunks = [];
        for await (const chunk of readable) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }
        return Buffer.concat(chunks).toString('utf8');
      };

      let body = req.body;
      if (!body) {
        const raw = await getRawBody(req);
        if (raw) {
          try {
            body = JSON.parse(raw);
          } catch (e) {
            body = raw;
          }
        }
      }

      if (typeof body === 'string') {
        body = JSON.parse(body);
      }

      const { name, githubId, leetcodeId, codechefId } = body || {};

      const userProfile = await prisma.userProfile.upsert({
        where: { email },
        update: {
          name,
          githubId,
          leetcodeId,
          codechefId,
        },
        create: {
          email,
          name,
          githubId,
          leetcodeId,
          codechefId,
        },
      });

      return res.status(200).json({ success: true, profile: userProfile });
    } catch (error) {
      console.error("POST user-profile error:", error);
      return res.status(500).json({ error: 'Failed to update user profile' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
