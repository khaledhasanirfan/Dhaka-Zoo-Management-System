import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client"; 
import bcrypt from "bcryptjs";
import { FoodCategory } from "@prisma/client"

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run the seed script.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const imageUrls = {
  tiger:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Bengal_tiger_in_Sanjay_Dubri_Tiger_Reserve_December_2024_by_Tisha_Mukherjee_11.jpg/960px-Bengal_tiger_in_Sanjay_Dubri_Tiger_Reserve_December_2024_by_Tisha_Mukherjee_11.jpg",
  elephant:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Elephas_maximus_%28Bandipur%29.jpg/960px-Elephas_maximus_%28Bandipur%29.jpg",
  lion:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/020_The_lion_king_Snyggve_in_the_Serengeti_National_Park_Photo_by_Giles_Laurent.jpg/960px-020_The_lion_king_Snyggve_in_the_Serengeti_National_Park_Photo_by_Giles_Laurent.jpg",
  giraffe:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Giraffe_Mikumi_National_Park.jpg/960px-Giraffe_Mikumi_National_Park.jpg",
  zebra:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Equus_quagga_burchellii_-_Etosha%2C_2014.jpg/960px-Equus_quagga_burchellii_-_Etosha%2C_2014.jpg",
  deer:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/066_Chital_in_Ranthambore_National_Park_Photo_by_Giles_Laurent.jpg/960px-066_Chital_in_Ranthambore_National_Park_Photo_by_Giles_Laurent.jpg",
  sambar:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Sambar_%28Cervus_unicolor_unicolor%29_male.jpg/960px-Sambar_%28Cervus_unicolor_unicolor%29_male.jpg",
  hippo:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Portrait_Hippopotamus_in_the_water.jpg/960px-Portrait_Hippopotamus_in_the_water.jpg",
  rhino:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Great-Indian-one-horned-rhinoceros-at-Kaziranga-national-park-in-Assam-India.jpg/960px-Great-Indian-one-horned-rhinoceros-at-Kaziranga-national-park-in-Assam-India.jpg",
  crocodile:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Mugger_crocodile_%28Crocodylus_palustris%29_Gal_Oya.jpg/960px-Mugger_crocodile_%28Crocodylus_palustris%29_Gal_Oya.jpg",
  python: "https://upload.wikimedia.org/wikipedia/commons/3/32/Python_molurus_molurus_2.jpg",
  peacock:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Peacock_on_tree_%2852077240794%29.jpg/960px-Peacock_on_tree_%2852077240794%29.jpg",
  macaw: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Ara_macao%2C_Ara_ararauna_and_Ara_militaris.jpg",
  pelican:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Pelikan_Walvis_Bay.jpg/960px-Pelikan_Walvis_Bay.jpg",
  flamingo:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Flamingos_Laguna_Colorada.jpg/960px-Flamingos_Laguna_Colorada.jpg",
  monkey:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Rhesus_macaque_%28Macaca_mulatta_mulatta%29%2C_male%2C_Gokarna.jpg/960px-Rhesus_macaque_%28Macaca_mulatta_mulatta%29%2C_male%2C_Gokarna.jpg",
  chimp:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/015_Chimpanzee_at_Kibale_forest_National_Park_Photo_by_Giles_Laurent.jpg/960px-015_Chimpanzee_at_Kibale_forest_National_Park_Photo_by_Giles_Laurent.jpg",
  bear: "https://upload.wikimedia.org/wikipedia/commons/4/46/Sloth_bear_stand.jpg",
  hyena:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Hyaenidae_Diversity.jpg/960px-Hyaenidae_Diversity.jpg",
  jackal:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/033_Golden_jackal_in_Keoladeo_National_Park_Photo_by_Giles_Laurent.jpg/960px-033_Golden_jackal_in_Keoladeo_National_Park_Photo_by_Giles_Laurent.jpg",
  otter: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Fischotter%2C_Lutra_Lutra.JPG",
  tortoise:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/A._gigantea_Aldabra_Giant_Tortoise.jpg/960px-A._gigantea_Aldabra_Giant_Tortoise.jpg",
  eagle:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Eagles_together.jpg/960px-Eagles_together.jpg",
  owl:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Bubo_bubo_sibiricus_-_01.JPG/960px-Bubo_bubo_sibiricus_-_01.JPG",
  parrot:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Rainbow_lorikeet_%28Trichoglossus_moluccanus_moluccanus%29_Sydney.jpg/960px-Rainbow_lorikeet_%28Trichoglossus_moluccanus_moluccanus%29_Sydney.jpg",
  leopard:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nagarhole_Kabini_Karnataka_India%2C_Leopard_September_2013.jpg/960px-Nagarhole_Kabini_Karnataka_India%2C_Leopard_September_2013.jpg",
  fishingCat: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Prionailurus_viverrinus_01.jpg",
  porcupine:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Erethizon_dorsatum_-_Prince_Rupert.jpg/960px-Erethizon_dorsatum_-_Prince_Rupert.jpg",
  emu:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Emu_1_-_Tidbinbilla.jpg/960px-Emu_1_-_Tidbinbilla.jpg",
  kangaroo:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Forester_kangaroo_%28Macropus_giganteus_tasmaniensis%29_juvenile_hopping_Esk_Valley.jpg/960px-Forester_kangaroo_%28Macropus_giganteus_tasmaniensis%29_juvenile_hopping_Esk_Valley.jpg",
};

async function resetData() {
  await prisma.auditLog.deleteMany();
  await prisma.dayPlanZone.deleteMany();
  await prisma.dayPlan.deleteMany();
  await prisma.ticketZone.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.feedingLog.deleteMany();
  await prisma.healthRecord.deleteMany();
  await prisma.feedingSchedule.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.foodItem.deleteMany();
  await prisma.species.deleteMany();
  await prisma.caregiver.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.foodSupplier.deleteMany();
  await prisma.authority.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await resetData();

  const [admin, visitor] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Dhaka Zoo Admin",
        email: "admin@dhakazoo.local",
        passwordHash: await bcrypt.hash("Admin12345", 12),
        role: "ADMIN",
        phone: "+8801711000001",
      },
    }),
    prisma.user.create({
      data: {
        name: "Demo Visitor",
        email: "visitor@dhakazoo.local",
        passwordHash: await bcrypt.hash("Visitor12345", 12),
        role: "VISITOR",
        phone: "+8801711000002",
      },
    }),
  ]);

  const authorities = await Promise.all([
    prisma.authority.create({
      data: {
        name: "Dr. Samira Rahman",
        email: "samira.rahman@dhakazoo.local",
        phone: "+8801712000001",
        position: "Chief Wildlife Officer",
      },
    }),
    prisma.authority.create({
      data: {
        name: "Md. Arif Hossain",
        email: "arif.hossain@dhakazoo.local",
        phone: "+8801712000002",
        position: "Visitor Operations Lead",
      },
    }),
  ]);

  const zoneRows = [
    {
      name: "Tiger Trail",
      habitatType: "Shaded forest enclosure",
      capacity: 420,
      mapCoords: "23.8122,90.3441",
      description: "A leafy big-cat habitat inspired by the wetlands and forests of Bangladesh.",
    },
    {
      name: "Elephant Meadow",
      habitatType: "Open meadow",
      capacity: 520,
      mapCoords: "23.8129,90.3450",
      description: "Wide viewing paths, keeper talks, and enrichment spaces for large herbivores.",
    },
    {
      name: "Savanna Walk",
      habitatType: "Grassland",
      capacity: 600,
      mapCoords: "23.8137,90.3461",
      description: "Family-friendly trail for giraffes, zebras, deer, and grazing species.",
    },
    {
      name: "Wetlands & Reptiles",
      habitatType: "Wetland and reptile house",
      capacity: 360,
      mapCoords: "23.8140,90.3430",
      description: "Cool indoor galleries and water-side viewing for reptiles and aquatic mammals.",
    },
    {
      name: "Aviary Garden",
      habitatType: "Aviary",
      capacity: 450,
      mapCoords: "23.8115,90.3426",
      description: "Colorful bird habitats with quiet corners for photography and school groups.",
    },
    {
      name: "Primate Forest",
      habitatType: "Forest canopy",
      capacity: 380,
      mapCoords: "23.8108,90.3448",
      description: "Canopy-style habitats designed for observation, learning, and enrichment.",
    },
    {
      name: "Nocturnal Corner",
      habitatType: "Low-light small mammal area",
      capacity: 240,
      mapCoords: "23.8111,90.3468",
      description: "A calmer route for smaller mammals, owls, and evening-program exhibits.",
    },
  ];

  const zones = Object.fromEntries(
    await Promise.all(zoneRows.map((data) => prisma.zone.create({ data }))).then((rows) =>
      rows.map((zone) => [zone.name, zone]),
    ),
  );

  const caregivers = await Promise.all([
    prisma.caregiver.create({
      data: {
        name: "Nusrat Jahan",
        email: "nusrat.care@dhakazoo.local",
        phone: "+8801713000001",
        shift: "Morning",
        experience: 8,
        authorityId: authorities[0].id,
        zoneId: zones["Tiger Trail"].id,
      },
    }),
    prisma.caregiver.create({
      data: {
        name: "Fahim Ahmed",
        email: "fahim.care@dhakazoo.local",
        phone: "+8801713000002",
        shift: "Day",
        experience: 10,
        authorityId: authorities[0].id,
        zoneId: zones["Elephant Meadow"].id,
      },
    }),
    prisma.caregiver.create({
      data: {
        name: "Sadia Islam",
        email: "sadia.care@dhakazoo.local",
        phone: "+8801713000003",
        shift: "Morning",
        experience: 6,
        authorityId: authorities[1].id,
        zoneId: zones["Savanna Walk"].id,
      },
    }),
    prisma.caregiver.create({
      data: {
        name: "Tanvir Hasan",
        email: "tanvir.care@dhakazoo.local",
        phone: "+8801713000004",
        shift: "Evening",
        experience: 7,
        authorityId: authorities[0].id,
        zoneId: zones["Wetlands & Reptiles"].id,
      },
    }),
    prisma.caregiver.create({
      data: {
        name: "Maliha Karim",
        email: "maliha.care@dhakazoo.local",
        phone: "+8801713000005",
        shift: "Day",
        experience: 5,
        authorityId: authorities[1].id,
        zoneId: zones["Aviary Garden"].id,
      },
    }),
    prisma.caregiver.create({
      data: {
        name: "Imran Chowdhury",
        email: "imran.care@dhakazoo.local",
        phone: "+8801713000006",
        shift: "Morning",
        experience: 9,
        authorityId: authorities[0].id,
        zoneId: zones["Primate Forest"].id,
      },
    }),
    prisma.caregiver.create({
      data: {
        name: "Rumana Akter",
        email: "rumana.care@dhakazoo.local",
        phone: "+8801713000007",
        shift: "Evening",
        experience: 4,
        authorityId: authorities[1].id,
        zoneId: zones["Nocturnal Corner"].id,
      },
    }),
  ]);

  const caregiverByZone = Object.fromEntries(
    caregivers.map((caregiver) => [
      Object.values(zones).find((zone) => zone.id === caregiver.zoneId)?.name,
      caregiver,
    ]),
  );

  const speciesRows = [
    {
      name: "Bengal Tiger",
      dietType: "CARNIVORE",
      habitat: "Tropical forest and mangrove edges",
      description: "A flagship South Asian big cat and one of the most popular learning exhibits.",
    },
    {
      name: "Asian Elephant",
      dietType: "HERBIVORE",
      habitat: "Open grassland with shaded water access",
      description: "Large social herbivore known for intelligence, memory, and family groups.",
    },
    {
      name: "Lion",
      dietType: "CARNIVORE",
      habitat: "Dry grassland and rocky shelter",
      description: "Social big cat species used for lessons on predator behavior and conservation.",
    },
    {
      name: "Savanna Herbivore",
      dietType: "HERBIVORE",
      habitat: "Grassland paddock",
      description: "Giraffes and zebras model grazing adaptations, camouflage, and herd behavior.",
    },
    {
      name: "Deer",
      dietType: "HERBIVORE",
      habitat: "Wooded grassland",
      description: "Gentle hoofed mammals that help explain prey behavior and Bangladeshi habitats.",
    },
    {
      name: "Wetland Mammal",
      dietType: "HERBIVORE",
      habitat: "Pools and muddy banks",
      description: "Semi-aquatic mammals that connect visitors with river and wetland ecology.",
    },
    {
      name: "Reptile",
      dietType: "CARNIVORE",
      habitat: "Warm reptile house and shallow ponds",
      description: "Cold-blooded animals used to teach adaptation, patience, and habitat control.",
    },
    {
      name: "Aviary Bird",
      dietType: "OMNIVORE",
      habitat: "Aviary trees, ponds, and nesting spaces",
      description: "Bird collection highlighting migration, feathers, color, and flight.",
    },
    {
      name: "Primate",
      dietType: "OMNIVORE",
      habitat: "Canopy climbing structures",
      description: "Social animals that support lessons on intelligence and enrichment.",
    },
    {
      name: "Bear",
      dietType: "OMNIVORE",
      habitat: "Rocky den and shaded yard",
      description: "A flexible omnivore exhibit with feeding enrichment and keeper observation.",
    },
    {
      name: "Small Carnivore",
      dietType: "CARNIVORE",
      habitat: "Nocturnal and scrub habitat",
      description: "Smaller predators that teach food webs beyond famous large cats.",
    },
    {
      name: "Small Mammal",
      dietType: "OMNIVORE",
      habitat: "Quiet burrows, logs, and low-light spaces",
      description: "Compact mammals and mixed species useful for close observation and comparison.",
    },
  ] as const;

  const species = Object.fromEntries(
    await Promise.all(speciesRows.map((data) => prisma.species.create({ data }))).then((rows) =>
      rows.map((item) => [item.name, item]),
    ),
  );

  const foodItems = Object.fromEntries(
    await Promise.all(
      [
        { name: "Beef",          category: FoodCategory.MEAT,       unit: "kg"     },
        { name: "Chicken",       category: FoodCategory.MEAT,       unit: "kg"     },
        { name: "River Fish",    category: FoodCategory.FISH,       unit: "kg"     },
        { name: "Hay",           category: FoodCategory.HAY,        unit: "kg"     },
        { name: "Bamboo",        category: FoodCategory.PRODUCE,    unit: "bundle" },
        { name: "Bananas",       category: FoodCategory.PRODUCE,    unit: "kg"     },
        { name: "Mixed Fruit",   category: FoodCategory.PRODUCE,    unit: "kg"     },
        { name: "Leafy Greens",  category: FoodCategory.PRODUCE,    unit: "kg"     },
        { name: "Grain Pellets", category: FoodCategory.GRAIN,      unit: "kg"     },
        { name: "Insects",       category: FoodCategory.OTHER,      unit: "cup"    },
        { name: "Seeds",         category: FoodCategory.GRAIN,      unit: "kg"     },
        { name: "Vitamin Mix",   category: FoodCategory.SUPPLEMENT, unit: "scoop"  },
      ].map((data) =>
        prisma.foodItem.upsert({
          where: { name: data.name },
          update: {},
          create: data,
        })
      ),
    ).then((rows) => rows.map((food) => [food.name, food])),
  )

  const suppliers = await Promise.all([
    prisma.foodSupplier.create({
      data: {
        name: "Dhaka Fresh Meat Supply",
        email: "meat.supply@dhakazoo.local",
        phone: "+8801714000001",
        address: "Mirpur Section 1, Dhaka",
        supplyItems: ["Beef", "Chicken", "River Fish"],
      },
    }),
    prisma.foodSupplier.create({
      data: {
        name: "Green Basket Farms",
        email: "greenbasket@dhakazoo.local",
        phone: "+8801714000002",
        address: "Savar, Dhaka",
        supplyItems: ["Hay", "Bamboo", "Mixed Fruit", "Leafy Greens"],
      },
    }),
    prisma.foodSupplier.create({
      data: {
        name: "Zoo Nutrition Lab",
        email: "nutrition@dhakazoo.local",
        phone: "+8801714000003",
        address: "Mirpur Zoo Service Gate",
        supplyItems: ["Vitamin Mix", "Grain Pellets", "Seeds", "Insects"],
      },
    }),
  ]);

  const supplierByCategory = {
    meat: suppliers[0],
    produce: suppliers[1],
    nutrition: suppliers[2],
  };

  const animalRows = [
    ["Shurjo", "Bengal Tiger", "Tiger Trail", "2017-03-12", "MALE", "HEALTHY", imageUrls.tiger],
    ["Bonolota", "Bengal Tiger", "Tiger Trail", "2019-10-04", "FEMALE", "RECOVERING", imageUrls.tiger],
    ["Chaya", "Small Carnivore", "Tiger Trail", "2020-06-21", "FEMALE", "HEALTHY", imageUrls.leopard],
    ["Megh", "Asian Elephant", "Elephant Meadow", "2011-02-09", "MALE", "HEALTHY", imageUrls.elephant],
    ["Tara", "Asian Elephant", "Elephant Meadow", "2013-08-30", "FEMALE", "HEALTHY", imageUrls.elephant],
    ["Simba", "Lion", "Tiger Trail", "2016-04-18", "MALE", "HEALTHY", imageUrls.lion],
    ["Rafi", "Savanna Herbivore", "Savanna Walk", "2018-11-05", "MALE", "HEALTHY", imageUrls.giraffe],
    ["Bijli", "Savanna Herbivore", "Savanna Walk", "2021-01-17", "FEMALE", "HEALTHY", imageUrls.zebra],
    ["Maya", "Deer", "Savanna Walk", "2022-02-22", "FEMALE", "HEALTHY", imageUrls.deer],
    ["Nayan", "Deer", "Savanna Walk", "2020-12-10", "MALE", "HEALTHY", imageUrls.deer],
    ["Sundori", "Deer", "Savanna Walk", "2019-07-11", "FEMALE", "RECOVERING", imageUrls.sambar],
    ["Jaldhara", "Wetland Mammal", "Wetlands & Reptiles", "2014-09-02", "FEMALE", "HEALTHY", imageUrls.hippo],
    ["Ekshing", "Wetland Mammal", "Wetlands & Reptiles", "2012-05-15", "MALE", "HEALTHY", imageUrls.rhino],
    ["Kalo", "Reptile", "Wetlands & Reptiles", "2015-01-05", "MALE", "HEALTHY", imageUrls.crocodile],
    ["Ajgar", "Reptile", "Wetlands & Reptiles", "2018-07-26", "FEMALE", "HEALTHY", imageUrls.python],
    ["Mayur", "Aviary Bird", "Aviary Garden", "2021-04-12", "MALE", "HEALTHY", imageUrls.peacock],
    ["Ruby", "Aviary Bird", "Aviary Garden", "2020-03-19", "FEMALE", "HEALTHY", imageUrls.macaw],
    ["Dholeshwari", "Aviary Bird", "Aviary Garden", "2019-12-03", "FEMALE", "HEALTHY", imageUrls.pelican],
    ["Golapi", "Aviary Bird", "Aviary Garden", "2022-08-08", "FEMALE", "HEALTHY", imageUrls.flamingo],
    ["Buri", "Primate", "Primate Forest", "2017-06-14", "FEMALE", "HEALTHY", imageUrls.monkey],
    ["Bongo", "Primate", "Primate Forest", "2014-05-28", "MALE", "HEALTHY", imageUrls.chimp],
    ["Baloo", "Bear", "Nocturnal Corner", "2016-11-09", "MALE", "HEALTHY", imageUrls.bear],
    ["Hasi", "Small Carnivore", "Nocturnal Corner", "2020-09-23", "FEMALE", "SICK", imageUrls.hyena],
    ["Sonali", "Small Carnivore", "Nocturnal Corner", "2021-10-16", "FEMALE", "HEALTHY", imageUrls.jackal],
    ["Pani", "Small Mammal", "Wetlands & Reptiles", "2019-01-31", "MALE", "HEALTHY", imageUrls.otter],
    ["Dhira", "Small Mammal", "Nocturnal Corner", "1988-02-14", "FEMALE", "HEALTHY", imageUrls.tortoise],
    ["Shikari", "Aviary Bird", "Aviary Garden", "2018-06-06", "MALE", "HEALTHY", imageUrls.eagle],
    ["Nishi", "Aviary Bird", "Nocturnal Corner", "2020-12-28", "FEMALE", "HEALTHY", imageUrls.owl],
    ["Mithu", "Aviary Bird", "Aviary Garden", "2021-09-18", "MALE", "HEALTHY", imageUrls.parrot],
    ["Bawali", "Small Carnivore", "Nocturnal Corner", "2019-04-04", "MALE", "RECOVERING", imageUrls.fishingCat],
    ["Kanta", "Small Mammal", "Nocturnal Corner", "2022-01-20", "FEMALE", "HEALTHY", imageUrls.porcupine],
    ["Dour", "Savanna Herbivore", "Savanna Walk", "2020-07-07", "FEMALE", "HEALTHY", imageUrls.emu],
    ["Lafao", "Savanna Herbivore", "Savanna Walk", "2018-10-13", "MALE", "HEALTHY", imageUrls.kangaroo],
  ] as const;

  const animals = [];
  for (const [name, speciesName, zoneName, dob, gender, healthStatus, imageUrl] of animalRows) {
    animals.push(
      await prisma.animal.create({
        data: {
          name,
          speciesId: species[speciesName].id,
          zoneId: zones[zoneName].id,
          dob: new Date(dob),
          gender,
          healthStatus,
          imageUrl,
          caregiverId: caregiverByZone[zoneName]?.id,
        },
      }),
    );
  }

  const foodBySpecies = {
    "Bengal Tiger": ["Beef", "08:30", "Daily", "7 kg", supplierByCategory.meat.id],
    "Asian Elephant": ["Bamboo", "10:00", "Daily", "30 kg", supplierByCategory.produce.id],
    Lion: ["Chicken", "09:00", "Daily", "6 kg", supplierByCategory.meat.id],
    "Savanna Herbivore": ["Hay", "11:30", "Daily", "12 kg", supplierByCategory.produce.id],
    Deer: ["Leafy Greens", "09:45", "Daily", "5 kg", supplierByCategory.produce.id],
    "Wetland Mammal": ["Hay", "14:30", "Daily", "18 kg", supplierByCategory.produce.id],
    Reptile: ["River Fish", "15:00", "Every 2 days", "4 kg", supplierByCategory.meat.id],
    "Aviary Bird": ["Seeds", "08:15", "Daily", "2 kg", supplierByCategory.nutrition.id],
    Primate: ["Mixed Fruit", "10:30", "Daily", "4 kg", supplierByCategory.produce.id],
    Bear: ["Bananas", "13:15", "Daily", "6 kg", supplierByCategory.produce.id],
    "Small Carnivore": ["Chicken", "16:00", "Daily", "2 kg", supplierByCategory.meat.id],
    "Small Mammal": ["Grain Pellets", "12:00", "Daily", "2 kg", supplierByCategory.nutrition.id],
  } as const;

  for (const animal of animals) {
    const speciesName = speciesRows.find((row) => row.name === Object.keys(species).find((key) => species[key].id === animal.speciesId))?.name;
    const [foodName, time, frequency, quantity, supplierId] = foodBySpecies[speciesName ?? "Small Mammal"];
    await prisma.feedingSchedule.create({
      data: {
        animalId: animal.id,
        foodItemId: foodItems[foodName].id,
        time,
        frequency,
        quantity,
        supplierId,
      },
    });
    await prisma.healthRecord.create({
      data: {
        animalId: animal.id,
        status: animal.healthStatus,
        notes:
          animal.healthStatus === "HEALTHY"
            ? "Routine observation completed; appetite and behavior normal."
            : "Veterinary team monitoring with follow-up enrichment and diet notes.",
      },
    });
  }

  await prisma.ticket.create({
    data: {
      userId: visitor.id,
      visitDate: new Date("2026-06-14T00:00:00.000Z"),
      type: "FAMILY",
      price: 250,
      qrCode: "DZ-DEMO-FAMILY-001",
      status: "ACTIVE",
      ticketZones: {
        create: [
          { zoneId: zones["Tiger Trail"].id },
          { zoneId: zones["Aviary Garden"].id },
          { zoneId: zones["Savanna Walk"].id },
        ],
      },
    },
  });

  await prisma.dayPlan.create({
    data: {
      userId: visitor.id,
      date: new Date("2026-06-14T00:00:00.000Z"),
      notes: "Start early at Tiger Trail, then take a shaded lunch break near Aviary Garden.",
      zones: {
        create: [
          { zoneId: zones["Tiger Trail"].id, visitOrder: 1 },
          { zoneId: zones["Savanna Walk"].id, visitOrder: 2 },
          { zoneId: zones["Aviary Garden"].id, visitOrder: 3 },
        ],
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "SEED_DATABASE",
      tableName: "Database",
      recordId: "seed-20260531",
      newValue: {
        animals: animals.length,
        zones: Object.keys(zones).length,
        species: Object.keys(species).length,
      },
    },
  });

  console.log(`Seeded ${animals.length} animals, ${speciesRows.length} species, ${Object.keys(zones).length} zones.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
