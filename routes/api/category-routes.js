const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint
router.get('/', (req, res) => {
  Category.findAll({
    // Include associated Products
    include: [{ model: Product }]
  })
  .then(categories => res.json(categories))
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});


router.get('/:id', (req, res) => {
  Category.findOne({
    where: {
      id: req.params.id
    },
    include: [ Product ]
  })
  .then(category => {
    if (!category) {
      res.status(404).json({ message: 'No category found with this id' });
      return;
    }
    res.json(category);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});


router.post('/', (req, res) => {
  Category.create({
    category_name: req.body.category_name
  })
  .then(category => res.status(201).json(category))
  .catch(err => {
    console.log(err);
    res.status(400).json(err);
  });
});


router.put('/:id', (req, res) => {
  Category.update(req.body, {
    where: {
      id: req.params.id
    }
  })
  .then(result => {
    if (result[0] === 0) {
      res.status(404).json({ message: 'No category found with this id' });
      return;
    }
    res.json({ message: 'Category updated successfully' });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});


router.delete('/:id', (req, res) => {
  Category.destroy({
    where: {
      id: req.params.id
    }
  })
  .then(result => {
    if (result === 0) {
      res.status(404).json({ message: 'No category found with this id' });
      return;
    }
    res.json({ message: 'Category deleted successfully' });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});


module.exports = router;
