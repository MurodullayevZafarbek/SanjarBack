const express = require('express');
const mongoose = require('mongoose');
const token = require('./middleware/token');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');


// Use cookie-parser middleware
const { superAdmin, admin, worker } = require('./middleware/checkStatus');
const { limitAdmin, limitWorker } = require('./middleware/isLimit');
require('dotenv').config();

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/shop')
    .then(data => {
        console.log('Database connected !');
    })
    .catch(e => {
        console.log(e);
    })


app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cors({
    origin: 'http://192.168.1.112:5173', // Replace with your React app's URL
    // origin: 'http://localhost:5173', // Replace with your React app's URL
    credentials: true,               // Allow credentials (cookies, etc.)
    optionsSuccessStatus: 200        // Some legacy browsers choke on 204
}));
app.use(cookieParser());

app.use("/public", express.static(path.join(__dirname, 'public')))

app.use("/auth", require("./router/auth"));

app.use("/superadmin", token, superAdmin, require("./router/superAdmin"))
app.use("/admin", token,limitAdmin, admin, require("./router/admin"))
app.use("/worker", token, limitWorker,worker, require("./router/worker"))
app.use("*", (req, res) => {
    res.json({
        title: 404,
        status: false,
        message: "page not founded"
    })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => { console.log(`App running on ${PORT}`) })
