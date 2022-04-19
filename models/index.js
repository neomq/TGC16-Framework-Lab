const bookshelf = require('../bookshelf')

// A model represents one table
// An instance of the model represents one row in the table

// create a new Product model and store in the Product object
const Product = bookshelf.model('Product', {
    tableName: 'products',
    // one product belongs to one category
    // argument is the name of the model
    category() {
        return this.belongsTo('Category')
    },
    // one product can have many tags
    tags() {
        return this.belongsToMany('Tag');
    }
})

const Category = bookshelf.model('Category', {
    tableName: 'categories',
    // one category has many products
    products() {
        return this.hasMany('Product')
    }
})

const Tag = bookshelf.model('Tag',{
    tableName: 'tags',
    // one tag can belong to many products
    products() {
        return this.belongsToMany('Product')
    }
})


module.exports = { Product, Category, Tag };