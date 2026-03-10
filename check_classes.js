import connectDB from "./src/lib/mongodb.js";
import Class from "./src/models/Class.js";

async function checkClasses() {
    await connectDB();
    const classes = await Class.find({});
    console.log(JSON.stringify(classes, null, 2));
    process.exit(0);
}

checkClasses();
