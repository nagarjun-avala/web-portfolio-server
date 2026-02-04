import { Request, Response } from 'express';
import { db } from '@/lib/db';
import { seedIfNeeded } from "@/lib/helper";
import { slugify, ensureUniqueSlug } from '../utils/slugify';
import { calculateReadingTime } from '../utils/readingTime';

// Helper to dynamically select the Prisma delegate based on the section URL param
const getPrismaDelegate = (section: string) => {
  switch (section) {
    case 'projects': return db.project;
    case 'experience': return db.experience;
    case 'education': return db.education;
    case 'certifications': return db.certification;
    case 'blogs': return db.blog;
    default: return null;
  }
};

const PortfolioController = {
  getPortfolioData: async (req: Request, res: Response) => {
    try {
      // Parallel fetch for performance using Prisma
      // Note: We include relations for the Profile
      const [profile, projects, experience, education, certifications, blogs] =
        await Promise.all([
          db.profile.findFirst({
            include: {
              hero: true,
              about: true,
              techStack: {
                orderBy: { order: 'asc' }
              }
            }
          }),
          db.project.findMany({ orderBy: { order: 'asc' } }),
          db.experience.findMany({ orderBy: { order: 'asc' } }),
          db.education.findMany({ orderBy: { order: 'asc' } }),
          db.certification.findMany({ orderBy: { order: 'asc' } }),
          db.blog.findMany({ orderBy: { order: 'asc' } })
        ]);

      if (!profile) {
        await seedIfNeeded();
        // Return a specific status to prompt a retry or handle on client
        return res
          .status(404)
          .json({ success: false, message: "Profile initialized with seed data. Please refresh." });
      }

      const responseData = {
        ...profile,
        projects,
        experience,
        education,
        certifications,
        blogs,
      };

      res.json({ success: true, data: responseData });
    } catch (error) {
      console.error("Fetch Error:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  },

  getProjectBySlug: async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const project = await db.project.findUnique({
        where: { slug: String(slug) }
      });

      if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }

      res.json({ success: true, data: project });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  },

  getBlogById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { incrementView } = req.query;

      // Try to find by ID first, then by slug
      let blog = await db.blog.findUnique({
        where: { id: String(id) }
      }).catch(() => null);

      if (!blog) {
        // Try finding by slug
        blog = await db.blog.findUnique({
          where: { slug: String(id) }
        }).catch(() => null);
      }

      if (!blog) {
        return res.status(404).json({ success: false, message: "Blog not found" });
      }

      // Increment view count if requested (for frontend views)
      if (incrementView === 'true') {
        await db.blog.update({
          where: { id: blog.id },
          data: { viewCount: { increment: 1 } }
        });
        blog.viewCount += 1;
      }

      res.json({ success: true, data: blog });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  },

  createPortfolioSection: async (req: Request, res: Response) => {
    try {
      const section = Array.isArray(req.params.section) ? req.params.section[0] : req.params.section;
      const delegate = getPrismaDelegate(section);

      if (!delegate) {
        return res.status(400).json({ success: false, message: "Invalid section" });
      }

      let data = { ...req.body };

      // Blog-specific preprocessing
      if (section === 'blogs') {
        // Auto-generate slug if not provided
        if (!data.slug && data.title) {
          const baseSlug = slugify(data.title);
          const existingBlogs = await db.blog.findMany({ select: { slug: true } });
          data.slug = ensureUniqueSlug(baseSlug, existingBlogs.map(b => b.slug));
        }

        // Calculate reading time from content
        if (data.content) {
          data.readingTime = calculateReadingTime(data.content);
        }

        // Set publishedAt if status is PUBLISHED and not already set
        if (data.status === 'PUBLISHED' && !data.publishedAt) {
          data.publishedAt = new Date();
        }
      }

      // @ts-ignore - Prisma delegates share the create signature
      const newItem = await delegate.create({
        data
      });

      res.json({ success: true, message: "Item added", data: newItem });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  },

  updateSpecificSectionItem: async (req: Request, res: Response) => {
    try {
      const { section: rawSection, id } = req.params;
      const section = Array.isArray(rawSection) ? rawSection[0] : rawSection;
      const delegate = getPrismaDelegate(section);

      if (!delegate) {
        return res.status(400).json({ success: false, message: "Invalid section" });
      }

      let data = { ...req.body };

      // Blog-specific preprocessing
      if (section === 'blogs') {
        // Regenerate slug if title changed and slug not explicitly provided
        if (data.title && !req.body.slug) {
          const currentBlog = await db.blog.findUnique({ where: { id: String(id) }, select: { slug: true } });
          const newSlug = slugify(data.title);

          // Only update slug if it's different and not causing conflicts
          if (currentBlog && newSlug !== currentBlog.slug) {
            const existingBlogs = await db.blog.findMany({
              where: { id: { not: String(id) } },
              select: { slug: true }
            });
            data.slug = ensureUniqueSlug(newSlug, existingBlogs.map(b => b.slug));
          }
        }

        // Recalculate reading time if content changed
        if (data.content) {
          data.readingTime = calculateReadingTime(data.content);
        }

        // Update publishedAt if status changed to PUBLISHED
        if (data.status === 'PUBLISHED') {
          const currentBlog = await db.blog.findUnique({ where: { id: String(id) }, select: { publishedAt: true } });
          if (currentBlog && !currentBlog.publishedAt) {
            data.publishedAt = new Date();
          }
        }
      }

      // @ts-ignore - Prisma delegates share the update signature
      const updatedItem = await delegate.update({
        where: { id: String(id) },
        data
      });

      res.json({ success: true, message: "Item updated", data: updatedItem });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  },

  deleteSpecificSectionItemId: async (req: Request, res: Response) => {
    try {
      const { section: rawSection, id } = req.params;
      const section = Array.isArray(rawSection) ? rawSection[0] : rawSection;
      const delegate = getPrismaDelegate(section);

      if (!delegate) {
        return res.status(400).json({ success: false, message: "Invalid section" });
      }

      // @ts-ignore
      await delegate.delete({
        where: { id }
      });

      res.json({ success: true, message: "Item deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  },

  deleteEntirePortfolio: async (req: Request, res: Response) => {
    try {
      // Transactional delete to ensure clean state
      await db.$transaction([
        db.profile.deleteMany(),
        db.hero.deleteMany(),
        db.about.deleteMany(),
        db.techStackItem.deleteMany(),
        db.project.deleteMany(),
        db.experience.deleteMany(),
        db.education.deleteMany(),
        db.certification.deleteMany(),
        db.blog.deleteMany(),
        db.message.deleteMany(),
      ]);

      res.json({
        success: true,
        message: "Portfolio data deleted completely.",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  },

  updatePatch: async (req: Request, res: Response) => {
    try {
      const { hero, about, techStack, ...profileData } = req.body;

      // Check if profile exists
      const existingProfile = await db.profile.findFirst();

      let result;

      if (!existingProfile) {
        // Create completely new profile if missing
        result = await db.profile.create({
          data: {
            ...profileData,
            email: profileData.email || "placeholder@example.com", // Ensure required fields
            hero: hero ? { create: hero } : undefined,
            about: about ? { create: about } : undefined,
          }
        });
      } else {
        // Handle TechStack separately to avoid transactions
        if (techStack && Array.isArray(techStack)) {
          // Delete existing techStack items for this profile
          await db.techStackItem.deleteMany({
            where: { profileId: existingProfile.id }
          });

          // Create new techStack items
          if (techStack.length > 0) {
            await db.techStackItem.createMany({
              data: techStack.map((item: any, index: number) => ({
                profileId: existingProfile.id,
                category: item.category,
                items: item.items,
                order: item.order !== undefined ? item.order : index
              }))
            });
          }
        }

        // Prepare update data WITHOUT nested upserts to avoid transactions
        const updateData: any = { ...profileData };

        // Handle Hero separately
        if (hero) {
          const existingHero = await db.hero.findFirst({
            where: { profileId: existingProfile.id }
          });

          if (existingHero) {
            await db.hero.update({
              where: { id: existingHero.id },
              data: hero
            });
          } else {
            await db.hero.create({
              data: { ...hero, profileId: existingProfile.id }
            });
          }
        }

        // Handle About separately
        if (about) {
          const existingAbout = await db.about.findFirst({
            where: { profileId: existingProfile.id }
          });

          if (existingAbout) {
            await db.about.update({
              where: { id: existingAbout.id },
              data: about
            });
          } else {
            await db.about.create({
              data: { ...about, profileId: existingProfile.id }
            });
          }
        }

        // Update profile with only scalar fields (only if there are fields to update)
        if (Object.keys(updateData).length > 0) {
          await db.profile.update({
            where: { id: existingProfile.id },
            data: updateData
          });
        }

        // Fetch the complete updated profile with all relations
        result = await db.profile.findFirst({
          where: { id: existingProfile.id },
          include: {
            hero: true,
            about: true,
            techStack: {
              orderBy: { order: 'asc' }
            }
          }
        });
      }

      res.json({ success: true, message: "Profile updated", data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  },
  /**
   * Restore Portfolio from Backup JSON
   * Wipes DB and repopulates
   */
  restorePortfolio: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      if (!data || !data.email) {
        return res.status(400).json({ success: false, message: "Invalid backup data. Email required." });
      }

      // 1. Delete Everything
      await db.$transaction([
        db.profile.deleteMany(),
        db.hero.deleteMany(),
        db.about.deleteMany(),
        db.techStackItem.deleteMany(),
        db.project.deleteMany(),
        db.experience.deleteMany(),
        db.education.deleteMany(),
        db.certification.deleteMany(),
        db.blog.deleteMany(),
        db.message.deleteMany(), // Optional: Wipe messages too? Yes for full restore.
      ]);

      // 2. Re-create Profile & Related (Hero, About, TechStack)
      // Note: We strip IDs to let DB generate new ones to avoid collisions if strict
      // BUT for restore, we usually assume fresh DB. Let's just create new IDs.

      const {
        id, _id, createdAt, updatedAt,
        hero, about, techStack,
        projects, experience, education, certifications, blogs, messages,
        ...profileFields
      } = data;

      const newProfile = await db.profile.create({
        data: {
          ...profileFields,
          hero: hero ? { create: { ...removeMeta(hero) } } : undefined,
          about: about ? { create: { ...removeMeta(about) } } : undefined,
          techStack: techStack ? {
            create: techStack.map((t: any) => removeMeta(t))
          } : undefined
        }
      });

      // 3. Re-create Independent Collections
      // We can use createMany for these
      if (projects?.length) await db.project.createMany({ data: projects.map(removeMeta) });
      if (experience?.length) await db.experience.createMany({ data: experience.map(removeMeta) });
      if (education?.length) await db.education.createMany({ data: education.map(removeMeta) });
      if (certifications?.length) await db.certification.createMany({ data: certifications.map(removeMeta) });
      if (blogs?.length) await db.blog.createMany({ data: blogs.map(removeMeta) });

      // Messages are optional in export, but if present:
      if (messages?.length) await db.message.createMany({ data: messages.map(removeMeta) });

      res.json({ success: true, message: "Restoration complete." });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Restore Failed: " + (error as Error).message });
    }
  },
};

// Helper: Remove DB specific meta fields to avoid insert errors
const removeMeta = (obj: any) => {
  const { id, _id, profileId, createdAt, updatedAt, ...rest } = obj;
  return rest;
};

export default PortfolioController