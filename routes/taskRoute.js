const express = require('express');
const isAuthenticated = require('../auth');

const route = express.Router();
const taskModel = require('../models/taskModel');

// Create new task
route.post('/', isAuthenticated, async (req, res) => {
    try {
        if (!req.body.name) {
            return res.json("Task name is required");
        }
        const task = new taskModel(req.body);
        task.ownerId = req.user._id;
        await task.save();
        return res.json({ success: true, message: 'Task successfully added', data: task });
    } catch (error) {
        return res.json({error: error});
    }
});

// Delete task
route.delete('/', isAuthenticated, async (req, res) => {
    try {
        if (!req.body.id) {
            return res.json("Task id is required");
        }
        const deletedTask = await taskModel.findById(req.body.id);
        if (!deletedTask) {
            return res.json("Task not found");
        }
        if (deletedTask.ownerId != req.user._id) {
            return res.json({ success: false, message: 'You do not have permission to edit this task' });
        }
        await taskModel.findByIdAndDelete(req.body.id);
        return res.json({ success: true, message: 'Task successfully deleted', data: deletedTask });
    } catch (error) {
        return res.json({error: error});
    }
});

// Update task
route.put('/', isAuthenticated, async (req, res) => {
    try {
        const { id, name, description, category } = req.body;
        if (!id) {
            return res.json("Task id is required");
        }
        const taskExists = await taskModel.findById(id);
        if (!taskExists) {
            return res.json("Task not found");
        }
        if (taskExists.ownerId != req.user._id) {
            return res.json({ success: false, message: 'You do not have permission to edit this task' });
        }
        console.log(id, name, description, category);
        if (name) {
            await taskModel.findByIdAndUpdate(id, {name: name});
        }
        if (description) {
            await taskModel.findByIdAndUpdate(id, {description: description});
        }
        if (category) {
            await taskModel.findByIdAndUpdate(id, {category: category});
        }
        const updatedTask = await taskModel.findById(id);
        return res.json({ success: true, message: 'Task successfully updated', data: updatedTask });
    } catch (error) {
        return res.json({error: error});
    }
});

// Get all tasks or filter by certain fields (name, description, category, ownerId)
route.get('/', isAuthenticated, async (req, res) => {
    try { 
        const {name, description, category, ownerId} = req.query;

        // All tasks
        if (!name && !description && !category && !ownerId) {
            const tasks = await taskModel.find();
            if (!tasks) {
                return res.json({ message: "No tasks found" });
            }
            return res.send({tasks: tasks});
        }

        // Filter tasks by name, description, and category
        const queriedTasks = new Set();
        if (name) {
            const nameQuery = await taskModel.find({name: name});
            nameQuery.forEach(task => queriedTasks.add(task));
        }
        if (description) {
            const descriptionQuery = await taskModel.find({description: description});
            descriptionQuery.forEach(task => queriedTasks.add(task));
        }
        if (category) {
            const categoryQuery = await taskModel.find({category: category});
            categoryQuery.forEach(task => queriedTasks.add(task));
        }
        if (ownerId) {
            const ownerIdQuery = await taskModel.find({ownerId: ownerId});
            ownerIdQuery.forEach(task => queriedTasks.add(task));
        }
        return res.send({tasks: Array.from(queriedTasks)});
        
    } catch (error) {
        return res.json({error: error});
    }
});

module.exports = route;