var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient
const { ObjectID } = require('mongodb');
var db;

MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true }, (err, database) => {
  if (err) return console.log(err)
  db = database.db('examen')

  /* GET ALL PRODUCTS */
  router.get('/', (req, res) => {
    db.collection('inhaal').find().toArray((err, result) => {
      if (err) return
      res.render('list.ejs', { inhaalexamens: result })
    })
  })

  /* SHOW ADD PRODUCT FORM */
  router.get('/add', (req, res) => {
    res.render('add.ejs', {})
  })

  /* ADD PRODUCT TO DB */
  router.post('/add', (req, res) => {
    if (req.body.datum === '') {
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0');
      var yyyy = today.getFullYear();
      today = dd + '/' + mm + '/' + yyyy;
      req.body.datum = today;
    }
    // console.log(req.body.datum)
    req.body.key = req.body.student + req.body.examen + req.body.reden;
    console.log(req.body.key)
    db.collection('inhaal').find({key: req.body.key}).toArray((err, result) => {
      if (err) return
      if(!result[0]) {
        db.collection('inhaal').insertOne(req.body, (err, result) => {
          if (err) return
          res.redirect('/')
        })
      }
      else res.render('error', {message: 'Already exists'});
    })
  })

  // search form
  router.get('/search', (req, res) => {
    res.render('search.ejs', {})
  })

  // find a product 
  // search_not_found.ejs werkt niet 
  router.post('/search', (req, res) => {
    var query = { student: req.body.student }
    db.collection('inhaal').find(query).toArray((err, result) => {
      if (err) return
      if (result == '')
        res.render('search_not_found.ejs', {})
      else
        console.log(result)
        res.render('search_result.ejs', { examens: result })
    });
  })

  // delete a product
  router.post('/delete', (req, res) => {
    //var deletequery = {student : req.body.student}
    var objectID = new ObjectID(req.body._id)
    console.log(objectID)
    db.collection('inhaal').findOneAndDelete({ _id: objectID }, (err, result) => {
      if (err) return res.send(500, err)
      res.redirect('/')
    }
    )
  })


  //RENDER EDIT FORM 
  router.get('/edit', (req, res) => {
    var query = { student: req.query.student }
    db.collection('inhaal').findOne(query, (err, result) => {
      res.render('edit.ejs', { exaam: result })
    })
  })


  /* EDIT A PRODUCT */
  router.post('/edit', (req, res) => {
    console.log({ student: req.body })
    db.collection('inhaal').replaceOne({ student: req.body.student }, req.body)
    console.log(req.body)
    res.redirect('/')

  })
})


module.exports = router;