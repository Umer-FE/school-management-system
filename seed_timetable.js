import connectDB from "./src/lib/mongodb.js";
import Timetable from "./src/models/Timetable.js";
import Subject from "./src/models/Subject.js";
import Teacher from "./src/models/Teacher.js";
import Class from "./src/models/Class.js";

async function seedTimetable() {
    await connectDB();
    console.log("Cleaning up old timetable...");
    await Timetable.deleteMany({});

    console.log("Fetching subjects...");
    const subjects = await Subject.find({}).populate("classRef").populate("teacherRef");

    if (subjects.length === 0) {
        console.log("No subjects found. Run subject seed first.");
        process.exit(1);
    }

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const timeSlots = [
        { start: "08:00", end: "09:00" },
        { start: "09:00", end: "10:00" },
        { start: "10:30", end: "11:30" }, // Break between 10-10:30
        { start: "11:30", end: "12:30" },
        { start: "12:30", end: "01:30" }
    ];

    const entries = [];

    // Group subjects by Class to avoid overlaps in the same class
    const classGroups = {};
    subjects.forEach(sub => {
        if (!sub.classRef) return;
        const className = sub.classRef.name;
        if (!classGroups[className]) classGroups[className] = [];
        classGroups[className].push(sub);
    });

    console.log("Generating entries...");

    // For each class, assign subjects to slots and days
    for (const [className, classSubjects] of Object.entries(classGroups)) {
        let slotIndex = 0;
        let dayIndex = 0;

        // Assign each subject to 3 sessions per week
        for (const sub of classSubjects) {
            for (let i = 0; i < 3; i++) {
                const slot = timeSlots[slotIndex % timeSlots.length];
                const day = days[dayIndex % days.length];

                entries.push({
                    classRef: sub.classRef._id,
                    subjectRef: sub._id,
                    teacherRef: sub.teacherRef?._id || "69a0c8de14d3ed94702cc6c9", // Fallback if no teacher
                    dayOfWeek: day,
                    startTime: slot.start,
                    endTime: slot.end
                });

                slotIndex++;
                if (slotIndex % timeSlots.length === 0) {
                    dayIndex++;
                }
            }
        }
    }

    console.log(`Inserting ${entries.length} timetable entries...`);
    await Timetable.insertMany(entries);

    console.log("Timetable Seeding Complete!");
    process.exit(0);
}

seedTimetable().catch(err => {
    console.error(err);
    process.exit(1);
});
