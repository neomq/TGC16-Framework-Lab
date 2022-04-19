const bookshelf = require('../bookshelf')

// A model represents one table
// An instance of the model represents one row in the table

// create a new Product model and store in the Product object
const Product = bookshelf.model('Product', {
    tableName: 'products'
})

const Category = bookshelf.model('Category', {
    tableName: 'categories'
})

module.exports = { Product, Category };