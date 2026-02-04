
import { MongoClient, ObjectId } from 'mongodb';
import seedData from "../seed.json";

/**
 * Seeding Logic using Native MongoDB Driver
 * This bypasses Prisma's requirement for Replica Sets on creating relations/transactions,
 * allowing seeding on standalone MongoDB instances (common in local dev).
 */
const seedIfNeeded = async () => {
  let client: MongoClient | null = null;
  try {
    const url = process.env.DATABASE_URL;
    if (!url) {
      console.error("❌ DATABASE_URL is missing. Cannot seed.");
      return;
    }

    client = new MongoClient(url);
    await client.connect();

    const db = client.db(); // Uses the database from the connection string

    // 1. Check if profile exists
    const existingProfile = await db.collection("Profile").findOne({});

    if (!existingProfile) {
      console.log("🌱 Seeding initial database (Native Driver)...");

      // Create IDs manually to link relations
      const profileId = new ObjectId();

      // 2. Insert Profile
      await db.collection("Profile").insertOne({
        _id: profileId,
        name: seedData.name,
        title: seedData.meta.title,
        email: seedData.meta.email,
        phone: seedData.meta.phone,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // 3. Insert Hero
      if (seedData.hero) {
        await db.collection("Hero").insertOne({
          profileId: profileId,
          ...seedData.hero,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // 4. Insert About
      if (seedData.about) {
        const { experience, ...aboutData } = seedData.about as any;
        const aboutPayload: any = {
          profileId: profileId,
          ...aboutData,
          skills: aboutData.skills,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        if (experience) {
          aboutPayload.experienceYears = experience.years;
          aboutPayload.experienceLabel = experience.label;
        }

        await db.collection("About").insertOne(aboutPayload);
      }

      // 5. Tech Stack
      if (seedData.techStack) {
        const stacks = Object.entries(seedData.techStack).map(([category, items], idx) => ({
          profileId: profileId,
          category,
          items,
          order: idx,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
        if (stacks.length > 0) {
          await db.collection("TechStackItem").insertMany(stacks);
        }
      }

      // 6. Projects
      if (seedData.projects && seedData.projects.length > 0) {
        const projects = seedData.projects.map((p: any, idx: number) => ({
          ...p,
          order: idx,
          createdAt: new Date(),
          updatedAt: new Date(),
          category: p.cat, // Map 'cat' to 'category' if needed by schema? 
          // Accessing raw json, schema maps 'cat' to 'category' via @map("cat")?
          // Prisma schema: category String? @map("cat").
          // So in DB it should be "cat".
          // But wait, Prisma @map means the DB field is "cat" but code sees "category".
          // If we use native driver, we must match DB field names!

          // Re-checking Schema:
          // model Project { ... category String? @map("cat") ... description String? @map("desc") ... imageUrl String? @map("img") }

          // seedData has "cat", "desc", "img".
          // So we can just use them as is if we want them to match the DB column name.
          // But Prisma Client expects to map them back.
          // If DB has "cat", Prisma reads "cat" -> "category".
          // seedData has "cat": "EdTech".
          // So we insert "cat".
        }));
        // However, let's look at seed.json again.
        // seed.json: "cat": "EdTech", "desc": "...", "img": "..."
        // Schema: @map("cat").
        // So insert key should be "cat".
        await db.collection("Project").insertMany(projects);
      }

      // 7. Experience
      if (seedData.experience?.length) {
        const exps = seedData.experience.map((e: any, idx: number) => ({
          ...e,
          order: idx,
          start: e.start ? new Date(e.start) : undefined,
          end: e.end ? new Date(e.end) : undefined,
          createdAt: new Date(),
          updatedAt: new Date()
          // Schema: description @map("desc"). seedData has "desc".
        }));
        await db.collection("Experience").insertMany(exps);
      }

      // 8. Education
      if (seedData.education?.length) {
        const edus = seedData.education.map((e: any, idx: number) => ({
          ...e,
          order: idx,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
        await db.collection("Education").insertMany(edus);
      }

      // 9. Certifications
      if (seedData.certifications?.length) {
        const certs = seedData.certifications.map((c: any, idx: number) => ({
          ...c,
          order: idx,
          issueDate: c.issueDate ? new Date(c.issueDate) : undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
        await db.collection("Certification").insertMany(certs);
      }

      console.log("✅ Seeding complete (Native Driver).");
    }
  } catch (error) {
    console.error("❌ Native Seeding failed:", error);
  } finally {
    if (client) {
      await client.close();
    }
  }
};

export { seedIfNeeded };