const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', (req, res) => {
  console.log('test');
  Tag.findAll({
    // where: {
    //   id: req.params.id,
    // },
    
    include: [
      {
        
        model: Product,
        through: ProductTag, // Specifies the junction table
        // as: 'products'
      }
    ]
  })
  .then(tags => res.status(200).json(tags))
  .catch(err => 
    // console.error(err);
    res.status(404).json(err));
  });



router.get('/:id', (req, res) => {
  Tag.findOne({
    where: {
      id: req.params.id
    },
    include: [
      {
        model: Product,
        through: ProductTag,
        as: 'products'
      }
    ]
  })
  .then(tag => {
    if (!tag) {
      res.status(404).json({ message: 'No tag found with this id' });
      return;
    }
    res.json(tag);
  })
  .catch(err => {
    console.error(err);
    res.status(500).json(err);
  });
});

router.post('/', (req, res) => {
  Tag.create({
    tag_name: req.body.tag_name
  })
  .then(tag => res.status(201).json(tag))
  .catch(err => {
    console.error(err);
    res.status(400).json(err);
  });
});



router.put('/:id', (req, res) => {
  Tag.update(
    {
      name: req.body.name
    },
    {
      where: {
        id: req.params.id
      }
    }
  )
  .then(tag => {
    if (!tag) {
      res.status(404).json({ message: 'No tag found with this id' });
      return;
    }
    res.json(tag);
  })
  .catch(err => {
    console.error(err);
    res.status(500).json(err);
  });
});


router.delete('/:id', (req, res) => {
  Tag.destroy({
    where: {
      id: req.params.id
    }
  })
  .then(tag => {
    if (!tag) {
      res.status(404).json({ message: 'No tag found with this id' });
      return;
    }
    res.json({ message: 'Tag deleted' });
  })
  .catch(err => {
    console.error(err);
    res.status(500).json(err);
  });
});


module.exports = router;
