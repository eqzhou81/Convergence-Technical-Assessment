const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const graphqlHTTP = require("express-graphql");
const schema = require("./schema/schema");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser()); 

const userRoute = require('./routes/userRoute');
const taskRoute = require('./routes/taskRoute');

mongoose.connect("mongodb+srv://"+process.env.NAME+":"+process.env.PASSWORD+"@todolist-gql.vni9p8m.mongodb.net/?retryWrites=true&w=majority");
mongoose.connection.once("open", () => {
    console.log("Connected to database");
});

const port = 3000;

app.use("/graphql", graphqlHTTP({
    schema,
    graphiql: true
}));

app.use('/user', userRoute);

app.use('/task', taskRoute);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});