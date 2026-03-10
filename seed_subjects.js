import connectDB from "./src/lib/mongodb.js";
import Subject from "./src/models/Subject.js";

const subjectsData = [
    // 9th Grade (ID: 69a0c9d767598b55d470f8ab)
    { name: "English (9th)", code: "ENG-9", classRef: "69a0c9d767598b55d470f8ab" },
    { name: "Urdu (9th)", code: "URD-9", classRef: "69a0c9d767598b55d470f8ab" },
    { name: "Islamiat (9th)", code: "ISL-9", classRef: "69a0c9d767598b55d470f8ab" },
    { name: "Sindhi (9th)", code: "SIND-9", classRef: "69a0c9d767598b55d470f8ab" },
    { name: "Mathematics (9th)", code: "MATH-9", classRef: "69a0c9d767598b55d470f8ab" },
    { name: "Physics (9th)", code: "PHY-9", classRef: "69a0c9d767598b55d470f8ab" },
    { name: "Chemistry (9th)", code: "CHEM-9", classRef: "69a0c9d767598b55d470f8ab" },
    { name: "Biology (9th)", code: "BIO-9", classRef: "69a0c9d767598b55d470f8ab" },
    { name: "Computer Science (9th)", code: "CS-9", classRef: "69a0c9d767598b55d470f8ab" },

    // 10th Grade (ID: 69a0c9a467598b55d470f862)
    { name: "English (10th)", code: "ENG-10", classRef: "69a0c9a467598b55d470f862" },
    { name: "Urdu (10th)", code: "URD-10", classRef: "69a0c9a467598b55d470f862" },
    { name: "Pakistan Studies (10th)", code: "PST-10", classRef: "69a0c9a467598b55d470f862" },
    { name: "Mathematics (10th)", code: "MATH-10", classRef: "69a0c9a467598b55d470f862" },
    { name: "Physics (10th)", code: "PHY-10", classRef: "69a0c9a467598b55d470f862" },
    { name: "Chemistry (10th)", code: "CHEM-10", classRef: "69a0c9a467598b55d470f862" },
    { name: "Biology (10th)", code: "BIO-10", classRef: "69a0c9a467598b55d470f862" },
    { name: "Computer Science (10th)", code: "CS-10", classRef: "69a0c9a467598b55d470f862" },

    // 11th Grade (ID: 69a1b34acc762410124e837a)
    { name: "English (11th)", code: "ENG-11", classRef: "69a1b34acc762410124e837a" },
    { name: "Urdu (11th)", code: "URD-11", classRef: "69a1b34acc762410124e837a" },
    { name: "Islamiat (11th)", code: "ISL-11", classRef: "69a1b34acc762410124e837a" },
    { name: "Physics (11th)", code: "PHY-11", classRef: "69a1b34acc762410124e837a" },
    { name: "Chemistry (11th)", code: "CHEM-11", classRef: "69a1b34acc762410124e837a" },
    { name: "Biology (11th)", code: "BIO-11", classRef: "69a1b34acc762410124e837a" },
    { name: "Mathematics (11th)", code: "MATH-11", classRef: "69a1b34acc762410124e837a" },

    // 12th Grade (ID: 69a0d6b167598b55d470fcd3)
    { name: "English (12th)", code: "ENG-12", classRef: "69a0d6b167598b55d470fcd3" },
    { name: "Urdu (12th)", code: "URD-12", classRef: "69a0d6b167598b55d470fcd3" },
    { name: "Pakistan Studies (12th)", code: "PST-12", classRef: "69a0d6b167598b55d470fcd3" },
    { name: "Physics (12th)", code: "PHY-12", classRef: "69a0d6b167598b55d470fcd3" },
    { name: "Chemistry (12th)", code: "CHEM-12", classRef: "69a0d6b167598b55d470fcd3" },
    { name: "Biology (12th)", code: "BIO-12", classRef: "69a0d6b167598b55d470fcd3" },
    { name: "Mathematics (12th)", code: "MATH-12", classRef: "69a0d6b167598b55d470fcd3" },
];

async function seedSubjects() {
    await connectDB();
    console.log("Seeding subjects...");

    for (const sub of subjectsData) {
        try {
            await Subject.findOneAndUpdate(
                { code: sub.code },
                sub,
                { upsert: true, new: true }
            );
            console.log(`Successfully added/updated: ${sub.name}`);
        } catch (err) {
            console.error(`Error adding ${sub.name}:`, err.message);
        }
    }

    console.log("Seeding complete!");
    process.exit(0);
}

seedSubjects();
