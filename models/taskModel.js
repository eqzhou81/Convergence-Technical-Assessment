const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    name: String,
    description: String,
    category: String,
    ownerId: String,
})

module.exports = mongoose.model("Task", taskSchema);