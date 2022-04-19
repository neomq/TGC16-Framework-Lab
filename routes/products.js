const express = require("express");
const router = express.Router();

// import in the Product model
const { Product } = require('../models')
// import in forms
const { bootstrapField, createProductForm } = require('../forms');
const { Router } = require("express");

// Display all products
router.get('/', async (req,res)=>{
    // #2 - fetch all the products (ie, SELECT * from products)
    let foods = await Product.collection().fetch();
    res.render('products/index', {
        'foods': foods.toJSON() // #3 - convert collection to JSON
    })
})

// CREATE
// Create new product
router.get('/create', async (req,res)=>{
    const form = createProductForm(); // get an instance of createProductForm
    res.render('products/create', {
        'newProductForm': form.toHTML(bootstrapField)
    })
})
// process create
router.post('/create', async (req,res)=>{
    const form = createProductForm(); // create form object once more
    
    form.handle(req, {
        'success': async (form) => {
            const food = new Product();
            // food.set('name', form.data.name);
            // food.set('cost', form.data.cost);
            // food.set('description', form.data.description);
            food.set(form.data);
            await food.save();
            res.redirect('/products');
        },
        // display error message
        'error': async (form) => {
            res.render('products/create', {
                'newProductForm': form.toHTML(bootstrapField)
            })
        }
    })
})

// UPDATE
// Update existing product
router.get('/:product_id/update', async (req,res)=>{
    // retrieve the product to update
    const productId = req.params.product_id
    const food = await Product.where({
        'id': productId
    }).fetch({
        require: true
    });

    const form = createProductForm(); 

    // display existing values in form
    form.fields.name.value = food.get('name');
    form.fields.cost.value = food.get('cost');
    form.fields.description.value = food.get('description');

    // render update form
    res.render('products/update', {
        'updateProductForm': form.toHTML(bootstrapField),
        'food': food.toJSON()
    })
})

// process update
router.post('/:product_id/update', async (req,res)=>{
     // retrieve product to update
    const productId = req.params.product_id
    const food = await Product.where({
        'id': productId
    }).fetch({
        require: true
    });

    const form = createProductForm();
    form.handle(req, {
        'success': async (form) => {
            // food.set('name', form.data.name);
            // food.set('cost', form.data.cost);
            // food.set('description', form.data.description);
            food.set(form.data);
            await food.save();
            res.redirect('/products');
        },
        // display error message
        'error': async (form) => {
            res.render('products/create', {
                'updateProductForm': form.toHTML(bootstrapField)
            })
        }
    })
})

// DELETE
// Delete existing product
router.get('/:product_id/delete', async (req,res)=>{
    // retrieve the product to delete
    const productId = req.params.product_id
    const food = await Product.where({
        'id': productId
    }).fetch({
        require: true
    });

    // render delete confirmation
    res.render('products/delete', {
        'food': food.toJSON()
    })
})

// process delete
router.post('/:product_id/delete', async (req,res)=>{
    // retrieve product to delete
    const productId = req.params.product_id
    const food = await Product.where({
        'id': productId
    }).fetch({
        require: true
    });

    await food.destroy(); // call the destroy function
    res.redirect('/products')
})

module.exports = router;