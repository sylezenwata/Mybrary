const express = require('express')
const router = express.Router()

const AuthorModel = require('../models/author')
const BookModel = require('../models/book')

const { Op } = require('sequelize');

// All Authors Route
router.get('/', async (req, res) => {
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = req.query.name;
  }
  try {
    const filter = { 
      name: {
        [Op.substring]: searchOptions.name,
      },
    };
    let authors = await AuthorModel.findAll({ limit: 50, order: [['id', 'DESC']] });
    if (searchOptions.name) {
      authors = await AuthorModel.findAll({ where: { ...filter }, limit: 50, order: [['id', 'DESC']] });
    }
    res.render('authors/index', {
      authors: authors,
      searchOptions: req.query
    });
  } catch (error) {
    console.log(error);
    res.redirect('/')
  }
})

// New Author Route
router.get('/new', (req, res) => {
  res.render('authors/new', { author: new AuthorModel() })
})

// Create Author Route
router.post('/new', async (req, res) => {
  const author = new AuthorModel({
    name: req.body.name
  });
  try {
    const newAuthor = await author.save()
    res.redirect(`/authors/${newAuthor.id}`)
  } catch {
    res.render('authors/new', {
      author: author,
      errorMessage: 'Error creating Author'
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const author = await AuthorModel.findByPk(req.params.id)
    const books = await BookModel.findAll({ where: { authorId: author.id }, limit: 50, order: [['id', 'DESC']] })
    res.render('authors/show', {
      author: author,
      booksByAuthor: books
    })
  } catch {
    res.redirect('/')
  }
})

router.get('/:id/edit', async (req, res) => {
  try {
    const author = await AuthorModel.findByPk(req.params.id)
    res.render('authors/edit', { author: author })
  } catch {
    res.redirect('/authors')
  }
})

router.put('/:id', async (req, res) => {
  let author
  try {
    author = await AuthorModel.findByPk(req.params.id)
    author.name = req.body.name
    await author.save()
    res.redirect(`/authors/${author.id}`)
  } catch {
    if (author == null) {
      res.redirect('/')
    } else {
      res.render('authors/edit', {
        author: author,
        errorMessage: 'Error updating Author'
      })
    }
  }
})

router.delete('/:id', async (req, res) => {
  let author
  try {
    author = await AuthorModel.findByPk(req.params.id)
    const hasBooks = await BookModel.findAll({ where: { authorId: author.id }, limit: 2 });
    if (hasBooks.length > 0) {
      throw new Error('Author has book(s)');
    }
    await author.destroy();
    res.redirect('/authors')
  } catch {
    if (author == null) {
      res.redirect('/')
    } else {
      res.redirect(`/authors/${author.id}`)
    }
  }
})

module.exports = router