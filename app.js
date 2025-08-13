const express = require('express');
const mongoose = require('mongoose');
const token = require('./middleware/token');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');

// Use cookie-parser middleware
const { superAdmin, admin, worker } = require('./middleware/checkStatus');
const { limitAdmin, limitWorker } = require('./middleware/isLimit');
const { barcodeAndUserId } = require('./controller/worker/goods');
require('dotenv').config();

const app = express();

mongoose.connect(process.env.DB)
    .then(data => {
        console.log('Database connected !');
    })
    .catch(e => {
        console.log(e);
    })


app.use(express.urlencoded({ extended: true }))
app.use(express.json());

const corsOptions = {
    origin: process?.env?.CORS?.split(";"), // Allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    credentials: true, // Allow cookies and authentication headers
    optionsSuccessStatus: 200        // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.use("/public", express.static(path.join(__dirname, 'public')))

app.use("/auth", require("./router/auth"));

app.get("/", async (req, res) => {
    res.json({
        title: "App runs"
    })
})
app.use("/mxik", require("./router/mxik"))
app.use("/getMaxsulot/:barcode/:adminId", barcodeAndUserId)

app.use("/superadmin", token, superAdmin, require("./router/superAdmin"))
app.use("/admin", token, limitAdmin, admin, require("./router/admin"))
app.use("/worker", token, limitWorker, worker, require("./router/worker"))
app.use("*", (req, res) => {
    res.json({
        title: 404,
        status: false,
        message: "page not founded"
    })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => { console.log(`App running on ${PORT}`) })
