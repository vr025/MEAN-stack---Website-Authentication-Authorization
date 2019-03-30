const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const postsRoutes = require("./routes/posts");
const userRoutes = require("./routes/user");
const path = require("path");

const app = express();

mongoose.connect("mongodb+srv://vignesh:zK8lNZR8mhKykpqp@cluster0-byx3s.mongodb.net/node-angular?retryWrites=true")
    .then(() => {
        console.log("Connected to database");
    })
    .catch(() => {
        console.log("Connection Failed");
    });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
    if (req.originalUrl === '/favicon.ico') {
      res.status(204).json({nope: true});
    } else {
      next();
    }
  });

  app.use((req, res, next)=> {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
        );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, OPTIONS, DELETE");
    next();
});


app.use("/api/posts", postsRoutes);
app.use("/api/user", userRoutes);

module.exports = app;

