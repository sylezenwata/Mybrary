const express = require('express')
const router = express.Router()

const BookModel = require('../models/book')
const AuthorModel = require('../models/author')

const { Op } = require('sequelize')
const fs = require('fs')
const path = require('path')

const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'];

// All Books Route
router.get('/', async (req, res) => {
  try {
    // TODO: enable searching with published date
    let { title = null, publishedBefore = null, publishedAfter = null } = req.query;
    let filter = {};
    if (title) {
      filter['title'] = {
        [Op.substring]: title,
      };
    }
    const books = await BookModel.findAll({ where: { ...filter }, limit: 100, order: [['id', 'DESC']] })
    res.render('books/index', {
      books: books,
      searchOptions: req.query
    });
  } catch {
    res.redirect('/')
  }
})

// New Book Route
router.get('/new', async (req, res) => {
  renderNewPage(res, new BookModel())
})

// Create Book Route
router.post('/new', async (req, res) => {
  const book = new BookModel({
    title: req.body.title,
    authorId: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description
  })
  await saveCover(book, req.body.cover)

  try {
    const newBook = await book.save()
    res.redirect(`/books/${newBook.id}`)
  } catch (error) {
    console.log(error);
    renderNewPage(res, book, true)
  }
})

// Show Book Route
router.get('/:id', async (req, res) => {
  try {
    const book = await BookModel.findByPk(req.params.id, {
      include: AuthorModel
    });
    res.render('books/show', { book: book })
  } catch {
    res.redirect('/')
  }
})

// Edit Book Route
router.get('/:id/edit', async (req, res) => {
  try {
    const book = await BookModel.findByPk(req.params.id)
    renderEditPage(res, book)
  } catch {
    res.redirect('/')
  }
})

// Update Book Route
router.put('/:id', async (req, res) => {
  let book
  try {
    book = await BookModel.findByPk(req.params.id)
    book.title = req.body.title
    book.authorId = req.body.author
    book.publishDate = new Date(req.body.publishDate)
    book.pageCount = req.body.pageCount
    book.description = req.body.description
    if (req.body.cover != null && req.body.cover !== '') {
      await saveCover(book, req.body.cover)
    }
    await book.save()
    res.redirect(`/books/${book.id}`)
  } catch {
    if (book != null) {
      renderEditPage(res, book, true)
    } else {
      redirect('/')
    }
  }
})

// Delete Book Page
router.delete('/:id', async (req, res) => {
  let book
  try {
    book = await BookModel.findByPk(req.params.id)
    await book.destroy()
    res.redirect('/books')
  } catch {
    if (book != null) {
      res.render('books/show', {
        book: book,
        errorMessage: 'Could not remove book'
      })
    } else {
      res.redirect('/')
    }
  }
})

async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await AuthorModel.findAll()
    const params = {
      authors: authors,
      book: book
    }
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Updating Book'
      } else {
        params.errorMessage = 'Error Creating Book'
      }
    }
    res.render(`books/${form}`, params)
  } catch {
    res.redirect('/books')
  }
}

async function saveCover(book, coverEncoded) {
  try {
    if (coverEncoded == null) return;
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
      const base64Data = cover.data.replace(/^data:image\/png;base64,/, "");
      const coverImageName = `${new Date().getTime()}.${getImageExtension(cover.type)}`;
      fs.writeFileSync(`${ path.join(__dirname,'../public/uploads/')}${coverImageName}`, base64Data, 'base64');
      book.coverImage = coverImageName;
    }
  } catch (error) {
    console.log(error);
  }
}

function getImageExtension(type) {
  let ext;
  switch (type.toString().toLowerCase()) {
    case 'image/jpeg':
      ext = 'jpg';
      break;
    case 'images/gif':
      ext = 'jpg';
      break;
    default:
      ext = 'png';
      break;
  }
  return ext;
}

module.exports = router