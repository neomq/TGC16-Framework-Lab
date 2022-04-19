const express = require("express");
const router = express.Router();

// import in the Product model
const { Product, Category, Tag } = require('../models')
// import in forms
const { bootstrapField, createProductForm } = require('../forms');
// const { Router } = require("express");

async function getAllCategories () {
    const allCategories = await Category.fetchAll().map((c) => {
        return [ c.get('id'),  c.get('name') ]
    })
    return allCategories;
}

async function getAllTags () {
    const allTags = await Tag.fetchAll().map( tag => 
        [tag.get('id'), tag.get('name')])
    return allTags;
}

// Display all products
router.get('/', async (req,res)=>{
    // #2 - fetch all the products (ie, SELECT * from products)
    let foods = await Product.collection().fetch({
        // load the category and tag relationship
        withRelated:['category', 'tags']
    });
    res.render('products/index', {
        'foods': foods.toJSON() // #3 - convert collection to JSON
    })
})

// CREATE
// Create new product
router.get('/create', async (req,res) => {

    // get categories
    const allCategories = await getAllCategories();
    // get tags
    const allTags = await getAllTags();

    const form = createProductForm(allCategories, allTags); // get an instance of createProductForm
    res.render('products/create', {
        'newProductForm': form.toHTML(bootstrapField)
    })
})
// process create
router.post('/create', async (req,res)=>{
    
    // get categories
    const allCategories = await getAllCategories();
    // get tags
    const allTags = await getAllTags();

    const form = createProductForm(allCategories, allTags); // create form object once more
    
    form.handle(req, {
        'success': async (form) => {
            let {tags, ...foodData} = form.data;
            const food = new Product(foodData);
            // food.set('name', form.data.name);
            // food.set('cost', form.data.cost);
            // food.set('description', form.data.description);
            // food.set(form.data);
            await food.save();
            // if user has selected tags, attach it to the product
            if (tags) {
                await food.tags().attach(tags.split(","));
            }
            req.flash("success_messages", `New Product ${food.get('name')} has been created`)
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
        require: true,
        withRelated:['tags']
    });

    // get categories
    const allCategories = await getAllCategories();
    // get tags
    const allTags = await getAllTags();

    const form = createProductForm(allCategories, allTags); 

    // display existing values in form
    form.fields.name.value = food.get('name');
    form.fields.cost.value = food.get('cost');
    form.fields.description.value = food.get('description');
    form.fields.category_id.value = food.get('category_id');

    // display selected tags
    let selectedTags = await food.related('tags').pluck('id');
    form.fields.tags.value = selectedTags;

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
        require: true,
        withRelated:['tags']
    });

    // get categories
    const allCategories = await getAllCategories();
    // get tags
    const allTags = await getAllTags();

    const form = createProductForm(allCategories, allTags);
    form.handle(req, {
        'success': async (form) => {
            let {tags, ...foodData} = form.data;
            // food.set('name', form.data.name);
            // food.set('cost', form.data.cost);
            // food.set('description', form.data.description);
            food.set(foodData);
            await food.save();
           
            // update the tags
            let tagIds = tags.split(',');
            let existingTagIds = await food.related('tags').pluck('id');

            // remove all the tags that aren't selected anymore
            let toRemove = existingTagIds.filter(id => tagIds.includes(id) === false);
            await food.tags().detach(toRemove);

            // add in all the tags selected in the form
            await food.tags().attach(tagIds);

            req.flash("success_messages", `New Product ${food.get('name')} has been updated`)
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
    req.flash("success_messages", `Product has been deleted`)
    res.redirect('/products')
})

module.exports = router;