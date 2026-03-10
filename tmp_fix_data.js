const mongoose = require('mongoose');
const uri = 'mongodb+srv://umerfetafsol_db_user:nmdp7788@admin.dgkjptx.mongodb.net/school_db?retryWrites=true&w=majority';

async function fix() {
    try {
        await mongoose.connect(uri);
        const db = mongoose.connection.db;
        const students = db.collection('students');

        await students.updateMany({ class: 'Grade 10' }, { $set: { class: '10th Grade' } });
        await students.updateMany({ class: 'Grade 11' }, { $set: { class: '11th Grade' } });
        await students.updateMany({ class: 'Grade 9' }, { $set: { class: '9th Grade' } });
        await students.updateMany({ class: 'Grade 8' }, { $set: { class: '8th Grade' } });

        console.log('Update Complete');
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

fix();
