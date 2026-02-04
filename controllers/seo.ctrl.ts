import { Request, Response } from "express";
import { db } from "@/lib/db";

const SeoController = {
  /**
   * GET /api/seo-settings
   * Fetch current SEO settings (creates default if none exist)
   */
  getSeoSettings: async (req: Request, res: Response) => {
    try {
      let settings = await db.seoSettings.findFirst();

      // If no settings exist, create default settings using raw MongoDB to avoid transaction
      if (!settings) {
        // Use raw MongoDB insert to bypass Prisma transactions
        const defaultData = {
          siteName: "Portfolio",
          defaultMetaTitle: "Welcome to My Portfolio",
          defaultMetaDescription: "A showcase of my work and expertise",
          authorName: "Portfolio Owner",
          canonicalUrlBase: "https://example.com",
          ogType: "website",
          twitterCardType: "SUMMARY_LARGE_IMAGE",
          enablePersonSchema: true,
          enableSearchEngineIndexing: true,
          robotsMetaDefault: "INDEX_FOLLOW",
          maxImagePreview: "LARGE",
          sitemapAutoGeneration: true,
          sitemapUpdateFrequency: "WEEKLY",
          forceHttps: true,
          trailingSlashPreference: false,
          enableLazyLoading: true,
          imageQualityDefault: 85,
          enableWebpConversion: true,
          defaultLanguage: "en",
          enableReadingTime: true,
          enableBreadcrumbs: true,
          breadcrumbSchema: true,
          ampSupport: false,
          rssFeedEnabled: true,
          createdAt: { $date: new Date().toISOString() },
          updatedAt: { $date: new Date().toISOString() },
        };

        // Use $runCommandRaw to insert directly without transaction
        await db.$runCommandRaw({
          insert: "SeoSettings",
          documents: [defaultData],
        });

        // Fetch the newly created settings
        settings = await db.seoSettings.findFirst();
      }

      res.json({ success: true, data: settings });
    } catch (error) {
      console.error("SEO Settings Fetch Error:", error);
      res
        .status(500)
        .json({ success: false, message: (error as Error).message });
    }
  },

  /**
   * PATCH /api/seo-settings
   * Update SEO settings (upsert pattern)
   */
  updateSeoSettings: async (req: Request, res: Response) => {
    try {
      const updateData = req.body;

      // Find existing settings
      const existingSettings = await db.seoSettings.findFirst();

      let settings;

      if (existingSettings) {
        // Update existing
        // Update existing using raw MongoDB
        await db.$runCommandRaw({
          update: "SeoSettings",
          updates: [
            {
              q: { _id: { $oid: existingSettings.id } },
              u: {
                $set: {
                  ...updateData,
                  updatedAt: { $date: new Date().toISOString() },
                },
              },
            },
          ],
        });

        settings = await db.seoSettings.findFirst();
      } else {
        // Create new using raw MongoDB to avoid transaction
        const dataWithTimestamps = {
          ...updateData,
          createdAt: { $date: new Date().toISOString() },
          updatedAt: { $date: new Date().toISOString() },
        };

        // Use $runCommandRaw to insert directly without transaction
        await db.$runCommandRaw({
          insert: "SeoSettings",
          documents: [dataWithTimestamps],
        });

        // Fetch the newly created settings
        settings = await db.seoSettings.findFirst();
      }

      res.json({
        success: true,
        message: "SEO settings updated",
        data: settings,
      });
    } catch (error) {
      console.error("SEO Settings Update Error:", error);
      res
        .status(500)
        .json({ success: false, message: (error as Error).message });
    }
  },

  /**
   * POST /api/seo-settings/reset
   * Reset SEO settings to defaults
   */
  resetSeoSettings: async (req: Request, res: Response) => {
    try {
      const existingSettings = await db.seoSettings.findFirst();

      if (!existingSettings) {
        return res
          .status(404)
          .json({ success: false, message: "No settings to reset" });
      }

      // Reset to default values
      const defaultSettings = {
        // Meta Information
        defaultMetaTitle: "Welcome to My Portfolio",
        metaTitleTemplate: "{Page Title} | {Site Name}",
        defaultMetaDescription: "A showcase of my work and expertise",
        siteName: "Portfolio",
        defaultKeywords: [],
        authorName: "Portfolio Owner",
        canonicalUrlBase: "https://example.com",

        // Social Media
        ogImageDefault: null,
        ogType: "website",
        twitterCardType: "SUMMARY_LARGE_IMAGE" as const,
        twitterHandle: null,
        facebookAppId: null,
        linkedinProfileUrl: null,

        // Structured Data
        enablePersonSchema: true,
        enableProfessionalServiceSchema: false,
        organizationName: null,
        jobTitle: null,
        skillsList: [],
        sameAsLinks: [],

        // Analytics
        googleAnalyticsId: null,
        googleTagManagerId: null,
        facebookPixelId: null,
        linkedinInsightTag: null,
        hotjarSiteId: null,
        plausibleDomain: null,

        // Search Engine
        enableSearchEngineIndexing: true,
        googleSearchConsoleVerification: null,
        bingWebmasterVerification: null,
        robotsMetaDefault: "INDEX_FOLLOW" as const,
        maxSnippetLength: null,
        maxImagePreview: "LARGE" as const,

        // Technical SEO
        sitemapAutoGeneration: true,
        sitemapUpdateFrequency: "WEEKLY" as const,
        customRobotsTxtRules: null,
        preferredDomain: null,
        forceHttps: true,
        trailingSlashPreference: false,

        // Performance
        enableLazyLoading: true,
        imageQualityDefault: 85,
        enableWebpConversion: true,
        preloadCriticalAssets: [],
        dnsPrefetchDomains: [],

        // Local SEO
        businessLocation: null,
        serviceAreas: [],
        businessHours: null,
        contactPhone: null,
        businessAddress: null,

        // Content Defaults
        defaultLanguage: "en",
        enableReadingTime: true,
        enableBreadcrumbs: true,
        breadcrumbSchema: true,

        // Advanced
        customHeadInjection: null,
        customFooterScripts: null,
        alternateLanguageTags: null,
        ampSupport: false,
        rssFeedEnabled: true,
      };

      // Use $runCommandRaw to avoid transaction error
      await db.$runCommandRaw({
        update: "SeoSettings",
        updates: [
          {
            q: { _id: { $oid: existingSettings.id } },
            u: {
              $set: {
                ...defaultSettings,
                updatedAt: { $date: new Date().toISOString() },
              },
            },
          },
        ],
      });

      const settings = await db.seoSettings.findFirst();

      res.json({
        success: true,
        message: "SEO settings reset to defaults",
        data: settings,
      });
    } catch (error) {
      console.error("SEO Settings Reset Error:", error);
      res
        .status(500)
        .json({ success: false, message: (error as Error).message });
    }
  },
};

export default SeoController;
