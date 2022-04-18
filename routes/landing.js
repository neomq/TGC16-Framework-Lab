const express = require("express");
const router = express.Router(); // #1 - Create a new express Router Object

//  #2 Add a new route to the Express router

// Landing Page
router.get('/', (req,res)=>{
    res.render('landing/index')
})

// About Us Page
router.get('/about-us', (req,res)=>{
    res.render('landing/about-us')
})

// Contact Us Page
router.get('/contact-us', (req,res)=>{
    res.render('landing/contact-us')
})

module.exports = router; // #3 export out the router object