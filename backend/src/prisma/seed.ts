import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sources = [
  {
    name: "TechCrunch AI",
    slug: "techcrunch-ai",
    feedUrl: "https://techcrunch.com/category/artificial-intelligence/feed/",
    websiteUrl: "https://techcrunch.com/category/artificial-intelligence/",
  },
  {
    name: "VentureBeat AI",
    slug: "venturebeat-ai",
    feedUrl: "https://venturebeat.com/category/ai/feed/",
    websiteUrl: "https://venturebeat.com/category/ai/",
  },
  {
    name: "MIT Technology Review",
    slug: "mit-tech-review",
    feedUrl:
      "https://www.technologyreview.com/topic/artificial-intelligence/feed",
    websiteUrl:
      "https://www.technologyreview.com/topic/artificial-intelligence/",
  },
  {
    name: "The Verge AI",
    slug: "verge-ai",
    feedUrl:
      "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    websiteUrl: "https://www.theverge.com/ai-artificial-intelligence",
  },
  {
    name: "Ars Technica AI",
    slug: "ars-technica-ai",
    feedUrl: "https://feeds.arstechnica.com/arstechnica/features",
    websiteUrl: "https://arstechnica.com/",
  },
  {
    name: "Wired AI",
    slug: "wired-ai",
    feedUrl: "https://www.wired.com/feed/tag/ai/latest/rss",
    websiteUrl: "https://www.wired.com/tag/ai/",
  },
];

async function main() {
  console.log("Seeding sources...");

  for (const source of sources) {
    await prisma.source.upsert({
      where: { slug: source.slug },
      update: source,
      create: source,
    });
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
