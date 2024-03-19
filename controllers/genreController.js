const Genre = require("../models/genre");
const Book = require("../models/book")
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const { isValidObjectId } = require("mongoose");
const {body, validationResult} = require("express-validator")


// Display list of all Genre.
exports.genre_list = asyncErrorHandler(async (req, res, next) => {
  const genres = await Genre.find({}, { "name": 1 }).sort({ name: 1 })
  res.render('genre_list',
    {
      title: "Genre List",
      genre_list: genres, useDefaultNav: true
    }
  )
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncErrorHandler(async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    // No results.
    const err = new Error("invalid Genre ID");
    err.status = 404;
    return next(err);
  }
  // Get details of genre and all associated books (in parallel)
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);
  if (genre === null) {
    // No results.
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("genre_detail", {
    title: "Genre Detail",
    genre: genre,
    genre_books: booksInGenre,
    useDefaultNav: true
  });
});

// Display Genre create form on GET.
exports.genre_create_get = asyncErrorHandler(async (req, res, next) => {
  res.render("genre_form", {
    title: "Create Genre", 
    useDefaultNav: true, 
    genre: undefined, 
    errors: []
  })
});

// Handle Genre create on POST.
exports.genre_create_post = [
  // Validate and sanitize the name field.
  (
    body("name", "Genre name must contain at least 3 characters")
      .trim()
      .isLength({ min: 3 })
      .escape()
  ),

  // Process request after validation and sanitization.
  asyncErrorHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("genre_form", {
        title: "Create Genre",
        genre: genre,
        errors: errors.array(),
        useDefaultNav: true
      });
      return;
    } 
      
    // Data from form is valid.
    // Check if Genre with same name already exists.
    const genreExists = 
      await Genre
        .findOne({ name: req.body.name })
        .collation({ locale: "en", strength: 2 })
        .exec();

    if (genreExists) {
      // Genre exists, redirect to its detail page.
      res.redirect(genreExists.url);
    } else {
      await genre.save();
      // New genre saved. Redirect to genre detail page.
      res.redirect(genre.url);
    }
    
  }),
];

// Display Genre delete form on GET.
exports.genre_delete_get = asyncErrorHandler(async (req, res, next) => {
  const [genre, genre_books] = await Promise.all([
    Genre.findById(req.params.id),
    Book.find({genre: req.params.id}).populate('author')
  ])
  if(genre === null) {
    res.redirect('/catalog/genres')
    return 
  }
  res.render('genre_delete', {title: "Delete Genre", genre, genre_books})
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncErrorHandler(async (req, res, next) => {
  const [genre, genre_books] = await Promise.all([
    Genre.findById(req.params.id),
    Book.find({genre: req.params.id}).populate('author')
  ])

  if(genre === null) {
    res.redirect('/catalog/genres')
    return 
  }

  if(genre_books.length > 0) {
    res.render('genre_delete', {title: "Delete Genre", genre, genre_books})
    return
  }

  await Genre.findByIdAndDelete(req.body.genreid);
  res.redirect("/catalog/genres");
});

// Display Genre update form on GET.
exports.genre_update_get = asyncErrorHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id)

  res.render("genre_form", {
    title: "Update Genre", 
    genre: genre, 
    errors: []
  })
});

// Handle Genre update on POST.
exports.genre_update_post = [
  // Validate and sanitize the name field.
  (
    body("name", "Genre name must contain at least 3 characters")
      .trim()
      .isLength({ min: 3 })
      .escape()
  ),

  // Process request after validation and sanitization.
  asyncErrorHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const genre = new Genre({ name: req.body.name, _id: req.params.id });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("genre_form", {
        title: "Update Genre",
        genre: genre,
        errors: errors.array(),
        useDefaultNav: true
      });
      return;
    } 
      
    // Data from form is valid.
    // Check if Genre with same name already exists.
    const genreExists = 
      await Genre
        .findOne({ name: req.body.name })
        .collation({ locale: "en", strength: 2 })
        .exec();

    if (genreExists) {
      // Genre exists, redirect to its detail page.
      res.redirect(genreExists.url);
    } else {
      await Genre.findByIdAndUpdate(req.params.id, genre, {})
      // New genre saved. Redirect to genre detail page.
      res.redirect(genre.url);
    }
    
  }),
];