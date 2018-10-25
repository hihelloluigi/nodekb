const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();

// Bring in User Model
let User = require('../models/user');

// Validator
const { check, validationResult } = require('express-validator/check');

// Register Form
router.get('/register', function(req, res) {
  res.render('register');
});

// Register Proccess
router.post('/register', [
  check('name').isLength({ min:1 }).withMessage('Name is required'),
  check('email').isLength({ min:1 }).withMessage('Email is required'),
  check('email').isEmail().withMessage('Email is not valid'),
  check('username').isLength({ min:1 }).withMessage('Username is required'),
  check("password")
    .isLength({ min: 4 }).withMessage("Invalid password")
    .custom((value,{req, loc, path}) => {
        if (value !== req.body.password2) {
            // trow error if passwords do not match
            throw new Error("Passwords don't match");
        } else {
            return value;
        }
    })
], function(req, res) {
  //Get Errors
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    console.log(errors);
    res.render('register', {
      errors:errors.mapped()
    });
  } else {
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    let newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password
    });

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newUser.password, salt, function(err, hash){
        if(err){
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function(err){
          if(err){
            console.log(err);
            return;
          } else {
            req.flash('success', 'You are now registerd and can log in');
            res.redirect('/users/login');
          }
        })
      });
    });
  }
});

// Login Form
router.get('/login', function(req, res){
  res.render('login');
});

// Login Proccess
router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login')
});

module.exports = router;
