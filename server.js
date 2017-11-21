var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");

var router = require("./controllers/controller.js");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

var MONGODB_URI = process.env.MONDODB_URI || "mongodb://localhost/News_Scraper";

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

// Routes
app.use('/', router);

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});