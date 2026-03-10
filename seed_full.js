import connectDB from "./src/lib/mongodb.js";
import User from "./src/models/User.js";
import Teacher from "./src/models/Teacher.js";
import Student from "./src/models/Student.js";
import Subject from "./src/models/Subject.js";
import Class from "./src/models/Class.js";
import bcrypt from "bcryptjs";

async function seed() {
    await connectDB();
    const saltRounds = 10;

    console.log("Seeding Teachers...");
    const teachersData = [
        { name: "Tariq Mahmood", email: "tariq@school.com", phone: "03001234567", subject: "Mathematics", salary: 75000, qualification: "M.Sc Mathematics", role: "teacher" },
        { name: "Saira Bano", email: "saira@school.com", phone: "03007654321", subject: "English", salary: 65000, qualification: "MA English", role: "teacher" },
        { name: "Adnan Malik", email: "adnan@school.com", phone: "03339876543", subject: "Physics", salary: 80000, qualification: "M.Sc Physics", role: "teacher" },
        { name: "Hina Khan", email: "hina@school.com", phone: "03211234567", subject: "Biology", salary: 70000, qualification: "M.Sc Biology", role: "teacher" }
    ];

    const teacherMap = {}; // email -> _id

    for (const t of teachersData) {
        const password = "teacher123";
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create User
        const user = await User.findOneAndUpdate(
            { email: t.email },
            { name: t.name, email: t.email, password: hashedPassword, role: "teacher" },
            { upsert: true, new: true }
        );

        // Create Teacher
        const teacher = await Teacher.findOneAndUpdate(
            { email: t.email },
            { name: t.name, email: t.email, phone: t.phone, subject: t.subject, salary: t.salary, qualification: t.qualification },
            { upsert: true, new: true }
        );
        teacherMap[t.email] = teacher._id;
        console.log(`Teacher seeded: ${t.name}`);
    }

    console.log("Assigning Class Teachers...");
    // 9th Grade
    await Class.findOneAndUpdate({ name: "9th Grade" }, { classTeacher: teacherMap["tariq@school.com"] });
    // 10th Grade
    await Class.findOneAndUpdate({ name: "10th Grade" }, { classTeacher: teacherMap["saira@school.com"] });
    // 11th Grade
    await Class.findOneAndUpdate({ name: "11th Grade" }, { classTeacher: teacherMap["adnan@school.com"] });
    // 12th Grade
    await Class.findOneAndUpdate({ name: "12th Grade" }, { classTeacher: teacherMap["hina@school.com"] });

    console.log("Assigning Teachers to Subjects...");
    // Assign teachers to some subjects based on their expertise
    await Subject.updateMany({ name: { $regex: /Mathematics/i } }, { teacherRef: teacherMap["tariq@school.com"] });
    await Subject.updateMany({ name: { $regex: /English/i } }, { teacherRef: teacherMap["saira@school.com"] });
    await Subject.updateMany({ name: { $regex: /Urdu/i } }, { teacherRef: teacherMap["saira@school.com"] });
    await Subject.updateMany({ name: { $regex: /Physics/i } }, { teacherRef: teacherMap["adnan@school.com"] });
    await Subject.updateMany({ name: { $regex: /Chemistry/i } }, { teacherRef: teacherMap["adnan@school.com"] });
    await Subject.updateMany({ name: { $regex: /Biology/i } }, { teacherRef: teacherMap["hina@school.com"] });
    await Subject.updateMany({ name: { $regex: /Computer/i } }, { teacherRef: teacherMap["adnan@school.com"] });
    await Subject.updateMany({ name: { $regex: /Pakistan Studies|Islamiat|Sindhi/i } }, { teacherRef: teacherMap["saira@school.com"] });

    console.log("Seeding Students...");
    const classInfo = await Class.find({});
    const classMap = {}; // name -> _id
    classInfo.forEach(c => classMap[c.name] = c._id);

    const studentsData = [
        { name: "Ahmed Ali", email: "ahmed@student.com", class: "9th Grade", gender: "Male", phone: "03000000001" },
        { name: "Fatima Zehra", email: "fatima@student.com", class: "9th Grade", gender: "Female", phone: "03000000002" },
        { name: "Bilal Ahmed", email: "bilal@student.com", class: "10th Grade", gender: "Male", phone: "03000000003" },
        { name: "Zainab Bibi", email: "zainab@student.com", class: "10th Grade", gender: "Female", phone: "03000000004" },
        { name: "Usman Ghani", email: "usman@student.com", class: "11th Grade", gender: "Male", phone: "03000000005" },
        { name: "Ayesha Noor", email: "ayesha@student.com", class: "11th Grade", gender: "Female", phone: "03000000006" },
        { name: "Hamza Khan", email: "hamza@student.com", class: "12th Grade", gender: "Male", phone: "03000000007" },
        { name: "Maryam Nawaz", email: "maryam@student.com", class: "12th Grade", gender: "Female", phone: "03000000008" }
    ];

    for (const s of studentsData) {
        const password = "student123";
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create User
        await User.findOneAndUpdate(
            { email: s.email },
            { name: s.name, email: s.email, password: hashedPassword, role: "student" },
            { upsert: true, new: true }
        );

        // Create Student
        await Student.findOneAndUpdate(
            { email: s.email },
            { name: s.name, email: s.email, class: s.class, classId: classMap[s.class], gender: s.gender, phone: s.phone },
            { upsert: true, new: true }
        );
        console.log(`Student seeded: ${s.name} in ${s.class}`);
    }

    console.log("All Seeding Complete!");
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
