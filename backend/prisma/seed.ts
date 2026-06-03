import { PrismaClient } from '@prisma/client';
import { hash } from '@node-rs/argon2';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'me@shuroku.local' },
    update: {},
    create: {
      email: 'me@shuroku.local',
      name: 'Aditya',
      passwordHash: await hash('changeme123'),
    },
  });

  const fma = await prisma.anime.upsert({
    where: { anilistId: 5114 },
    update: {},
    create: {
      anilistId: 5114,
      title: 'Fullmetal Alchemist: Brotherhood',
      titleRomaji: 'Hagane no Renkinjutsushi: Fullmetal Alchemist',
      titleEng: 'Fullmetal Alchemist: Brotherhood',
      year: 2009,
      episodes: 64,
      format: 'TV',
      status: 'FINISHED',
      genres: ['Action', 'Adventure', 'Drama', 'Fantasy'],
      popularity: 500000,
      averageScore: 90,
      coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/5114.jpg',
    },
  });

  await prisma.source.createMany({
    data: [
      { animeId: fma.id, kind: 'PAID', label: 'Crunchyroll', url: 'https://www.crunchyroll.com', embeddable: false },
      { animeId: fma.id, kind: 'PAID', label: 'Netflix', url: 'https://www.netflix.com', embeddable: false },
    ],
    skipDuplicates: true,
  });

  await prisma.libraryItem.upsert({
    where: { userId_animeId: { userId: user.id, animeId: fma.id } },
    update: {},
    create: { userId: user.id, animeId: fma.id, status: 'WATCHING', progressEp: 12, rating: 9 },
  });

  console.log('Seeded user me@shuroku.local (password: changeme123)');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
