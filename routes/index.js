const express = require('express')
const router = express.Router()
const BookModel = require('../models/book')

router.get('/', async (req, res) => {
  let books
  try {
    books = await BookModel.findAll({ limit: 50, order: [['id', 'DESC']] });
  } catch {
    books = []
  }
  res.render('index', { books: books })
})

module.exports = router