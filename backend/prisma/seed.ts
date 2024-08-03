import prisma from "./client";

async function main() {
  // Create a user
  console.log("in main");
  const user = await prisma.users.create({
    data: {
      email: "user@example.com",
      clerkId: "auth123",
      createdAt: new Date(),
      updatedAt: new Date(),
      avatarUrl: "http://example.com/avatar.png",
    },
  });
  console.log("user made");

  // Create arts
  const arts = [
    {
      bgColor: "red",
      userId: user.id,
      isPublished: true,
    },
    {
      bgColor: "blue",
      userId: user.id,
      isPublished: true,
    },
    {
      bgColor: "green",
      userId: user.id,
      isPublished: true,
    },
  ];

  for (const art of arts) {
    await prisma.art.create({
      data: art,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
