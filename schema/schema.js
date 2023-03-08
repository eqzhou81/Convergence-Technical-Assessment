const graphql = require("graphql");
const User = require("../models/userModel");
const Task = require("../models/taskModel");

const { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID, GraphQLList, GraphQLNonNull } = graphql;

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        username: { type: GraphQLString },
        password: { type: GraphQLString },
        tasks: { 
            type: new GraphQLList(TaskType),
            resolve(parent, args) {
                return Task.find({
                    ownerId: parent.id
                })
            }
        },
    })
});

const TaskType = new GraphQLObjectType({
    name: 'Task',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        category: { type: GraphQLString },
        owner: {
            type: UserType,
            resolve(parent, args) {
                return User.findById(parent.ownerId);
            }
        }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType', 
    fields: {
        user: {
            type: UserType,
            args: {id: { type: GraphQLID }},
            resolve(parent, args) {
                // Get user data from database
                return User.findById(args.id);
            }
        },
        task: {
            type: TaskType,
            args: {id: { type: GraphQLID }},
            resolve(parent, args) {
                // Get task data from database
                return Task.findById(args.id);
            }
        },
        users: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                // Get all users from database
                return User.find({});
            }
        },
        tasks: {
            type: new GraphQLList(TaskType),
            resolve(parent, args) {
                // Get all tasks from database
                return Task.find({});
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        // Add new user to db
        registerUser: {
            type: UserType,
            args: {
                username: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parent, args) {
                let user = new User({
                    username: args.username,
                    password: args.password
                });
                return user.save();
            }
        },
        // Add new task to db
        addTask: {
            type: TaskType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                description: { type: (GraphQLString) },
                category: { type: (GraphQLString) },
                ownerId: { type: (GraphQLID) }
            },
            resolve(parent, args) {
                let task = new Task({
                    name: args.name,
                    description: args.description,
                    category: args.category,
                    ownerId: args.ownerId
                });
                return task.save();
            }
        },
        deleteTask: {
            type: TaskType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args) {
                const deletedTask = taskModel.find(task => task.id === args.id);
                if (!deletedTask) {
                    throw new Error(`Task with ID ${args.id} not found`);
                }
                taskModel.users = taskModel.filter(task => task.id !== args.id);
                return deletedTask;
            }
        },
        updateTask: {
            type: TaskType,
            args: {
                id: { type: (GraphQLID) },
                name: { type: GraphQLString},
                description: { type: GraphQLString },
                category: { type: GraphQLString }
            },
            resolve(parent, args) {
                const { id, name, description, category } = args;

                const task = taskModel.find(task => task.id === id);
                if (!task) {
                    throw new Error(`Task not found with ID: ${id}`);
                }

                if (name) {
                    task.name = name;
                }

                if (description) {
                    task.description = description;
                }

                if (completed) {
                    task.category = category;
                }

                return task;
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});