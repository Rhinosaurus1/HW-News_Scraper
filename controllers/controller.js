var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');

var db = require("../models");

router.get('/', function (req, res){

  db.Article.find({})
    .populate('notes')
    .exec(function(err, doc){

    if (err){
      console.log(err);
    } 
    else {
      res.redirect('/articles');
    }

  });

});


router.get('/articles', function (req, res){
  
  db.Article.find({})
    .populate('notes')
    .exec(function(err, doc){

      if (err){
        console.log(err);
      } 
      else {
        var hbsObject = {articles: doc}
        res.render('index', hbsObject);
      }

  });

});


router.get('/saved', function (req, res){
  
  db.Article.find({"saved": true})
    .populate('notes')
    .exec(function(err, doc){

      if (err){
        console.log(err);
      } 
      else {
        var hbsObject = {saved: doc}
        res.render('index', hbsObject);
      }

  });

});

router.get('/scrape', function(req, res) {

  request('https://www.sciencenews.org/', function(error, response, html) {

    var $ = cheerio.load(html);

    var titlesArray = [];

    $("div.field-item-node-ref").each(function(i, element) {

        var result = {};

        result.title = $(element).children("article").children("header").children("h2").text().trim() +"";
        result.link = "https://www.sciencenews.org" + ($(element).children("article").children("header").children("h2").children("a").attr("href"));
        result.summary = $(element).children("article").children("div.content").text().trim() + "";

        if(result.title !== "" &&  result.summary !== ""){

          if(titlesArray.indexOf(result.title) == -1){

            titlesArray.push(result.title);

            db.Article.count({ title: result.title}, function (err, check){

              if(check == 0){
                var entry = new db.Article (result);
                entry.save(function(err, doc) {

                  if (err) {
                    console.log(err);
                  } 
                  else {
                    console.log(doc);
                  }

                });
              }

              else{
                console.log('Already in database')
              }

            });

        }
        else{
          console.log('Already in database')
        }

      }
      else{
        console.log('Missing component')
      }

    });

    res.redirect("/");

  });

});


router.post('/add/note/:id', function (req, res){
  var articleId = req.params.id;
  var noteContent = req.body.note;

  var result = {
    content: noteContent
  };

  var entry = new db.Note (result);

  entry.save(function(err, doc) {

    if (err) {
      console.log(err);
    } 
    else {
      db.Article.findOneAndUpdate({'_id': articleId}, {$push: {'notes':doc._id}}, {new: true})

      .exec(function(err, doc){

        if (err){
          console.log(err);
        } else {
          res.redirect("/saved");
        }

      });
    }

  });

});


router.post('/remove/note/:id', function (req, res){
  var noteId = req.params.id;
  db.Note.findByIdAndRemove(noteId, function (err, todo) {  
    
    if (err) {
      console.log(err);
    } 
    else {
      res.redirect("/saved");
    }

  });

});


router.get('/save/article/:id', function (req, res){
  var articleId = req.params.id;
  db.Article.update({'_id': articleId}, {$set:{'saved': true}}, function(err, saved){

    if (err){
      console.log(err);
    } 
    else {
      res.redirect("/");
    }

  });

});


router.get('/remove/article/:id', function (req, res){
  var articleId = req.params.id;
  db.Article.update({'_id': articleId}, {$set:{'saved': false}}, function(err, saved){

    if (err){
      console.log(err);
    } 
    else {
      res.redirect("/saved");
    }

  });

});

module.exports = router;