import mongoose from "mongoose";

const MONGODB_URI =
  "mongodb+srv://umerfetafsol_db_user:nmdp7788@admin.dgkjptx.mongodb.net/school_db?retryWrites=true&w=majority";

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB Connected... ✅");
  } catch (error) {
    console.log("MongoDB Connection Error: ❌", error);
  }
};

export default connectDB;
