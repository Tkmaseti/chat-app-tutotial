const express = require("express");
const cors = require("cors");
const app = express();

var corsOptions = {
    origin: "http://localhost:8081",
};

let http = require('http');
let server = http.Server(app);


let socketIO = require('socket.io');
let io = socketIO(server);


app.use(cors(corsOptions)); // parse requests of content-type - application/jsonapp.use(express.json());// parse requests of content-type -

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // simple route
const db = require("./models");
const Role = db.role;
var dbConfig = require("./config/db.config");
const nodemon = require("nodemon");
db.mongoose
    .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Successfully connect to MongoDB.");
        initial();
    })
    .catch((err) => {
        console.error("Connection error", err);
        process.exit();
    });

function initial() {
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Role({
                name: "user",
            }).save((err) => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'user' to roles collection");
            });
            new Role({
                name: "moderator",
            }).save((err) => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'moderator' to roles collection");
            });
            new Role({
                name: "admin",
            }).save((err) => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'admin' to roles collection");
            });
        }
    });
}

app.get("/", (req, res) => {
    res.json({ message: "Welcome to Tsepang Tutorial application." });
}); // set port, listen for

require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);


io.on('connection', (socket) => {
    socket.on('join', (data) => {
        socket.join(data.room);
        socket.broadcast.to(data.room).emit('user joined');
    });

    socket.on('message', (data) => {
        io.in(data.room).emit('new message', {user: data.user, message: data.message});
    });
});

const PORT = process.env.PORT || 8050;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
