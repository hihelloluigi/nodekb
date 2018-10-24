const express = require('express');
const router = express.Router();

// Bring in Article Model
let Article = require('../models/article');

// Validator
const { check, validationResult } = require('express-validator/check');

// Add Route
router.get('/add', function(req, res){
  res.render('add_article', {
    article: 'Add Article'
  });
});

// Add Submit POST Route
router.post('/add', [
  check('title').isLength({ min:1 }).withMessage('Title is required'),
  check('author').isLength({ min:1 }).withMessage('Author is required'),
  check('body').isLength({ min:1 }).withMessage('Body is required')
], function(req, res){
  //Get Errors
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    console.log(errors);
    res.render('add_article', {
      title:'Add Article',
      errors:errors.mapped()
    });
  } else {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    article.save(function(err) {
      if(err){
        console.log(err);
        return;
      } else {
        req.flash("success", "Article Added");
        res.redirect('/')
      }
    });
  }
});

// Load Edit Form
router.get('/edit/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    res.render('edit_article', {
      title: 'Edit',
      article: article
    });
  });
});

// Update Submit POST Route
router.post('/edit/:id', function(req, res){
  let article = {}
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id:req.params.id}

  Article.update(query, article, function(err){
    if(err){
      console.log(err);
      return;
    } else {
      req.flash("success", "Article Updated");
      res.redirect('/');
    }
  });
});

router.delete('/:id', function(req, res){
  let query = {_id:req.params.id}

  Article.remove(query, function(err){
    if(err) {
      console.log(err);
    }
    res.send('Success');
  });
});

// Get Single Article
router.get('/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    res.render('article', {
      article: article
    });
  });
});

module.exports = router;
