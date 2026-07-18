import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.incident.deleteMany();
  await prisma.stadiumZone.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();

  const [zoneA, zoneB, zoneC] = await Promise.all([
    prisma.stadiumZone.create({
      data: {
        name: 'Gate A - North',
        description: 'Main entrance for general admission and family zones.',
        crowdLevel: 'High',
        waitTime: 25,
      },
    }),
    prisma.stadiumZone.create({
      data: {
        name: 'Gate B - East',
        description: 'VIP and Accessibility entrance. Step-free access.',
        crowdLevel: 'Low',
        waitTime: 5,
      },
    }),
    prisma.stadiumZone.create({
      data: {
        name: 'Gate C - South',
        description: 'Near metro station. High traffic.',
        crowdLevel: 'Medium',
        waitTime: 15,
      },
    })
  ]);

  await Promise.all([
    prisma.incident.create({
      data: {
        type: 'Maintenance',
        severity: 'Medium',
        description: 'Escalator 3 is currently down for maintenance. Please use elevators for step-free access.',
        zoneId: zoneC.id,
      },
    }),
    prisma.incident.create({
      data: {
        type: 'Weather',
        severity: 'Low',
        description: 'Slight drizzle expected in the next hour.',
        zoneId: zoneA.id,
      },
    })
  ]);

  console.log('Seeded database with realistic stadium data.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
