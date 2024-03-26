const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', (req, res) => {
  Product.findAll({
    include: [
      {
        model: Category,
        attributes: ['id', 'category_name']
      },
      {
        model: Tag,
        attributes: ['id', 'tag_name'],
        through: ProductTag,
        as: 'tags'
      }
    ]
  })
  .then(products => res.json(products))
  .catch(err => {
    console.error(err);
    res.status(500).json(err);
  });
});


// get one product
router.get('/:id', (req, res) => {
  Product.findOne({
    where: {
      id: req.params.id
    },
    include: [
      {
        model: Category,
        attributes: ['id', 'category_name']
      },
      {
        model: Tag,
        attributes: ['id', 'tag_name'],
        through: ProductTag,
        as: 'tags'
      }
    ]
  })
  .then(product => {
    if (!product) {
      res.status(404).json({ message: 'No product found with this id' });
      return;
    }
    res.json(product);
  })
  .catch(err => {
    console.error(err);
    res.status(500).json(err);
  });
});


// create new product
router.post('/', (req, res) => {

    router.post('/', (req, res) => {
      // Destructure the product data from the request body
      const { product_name, price, stock, tagIds } = req.body;
    
      // Create a new product
      Product.create({
        product_name: "",
        price: 200.00,
        stock: 3,
        tagIds: [1, 2, 3, 4]
      })
      .then((product) => {
        // If there's product tags, create pairings to bulk create in the ProductTag model
        if (tagIds && tagIds.length) {
          const productTagIdArr = tagIds.map((tag_id) => {
            return {
              product_id: product.id,
              tag_id,
            };
          });
          return ProductTag.bulkCreate(productTagIdArr).then(() => product);
        }
        // If no product tags, just respond
        return product;
      })
      .then((product) => {
        // Respond with the product data
        res.status(200).json(product);
      })
      .catch((err) => {
        console.error('Error:', err);
        res.status(400).json(err);
      });
    });
    
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {

        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
            .filter((tag_id) => !productTagIds.includes(tag_id))
            .map((tag_id) => {
              return {
                product_id: req.params.id,
                tag_id,
              };
            });

          // figure out which ones to remove
          const productTagsToRemove = productTags
            .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
            .map(({ id }) => id);
          // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  Product.destroy({
    where: {
      id: req.params.id
    }
  })
  .then(deleted => {
    if (!deleted) {
      res.status(404).json({ message: 'No product found with this id' });
      return;
    }
    res.json({ message: 'Product successfully deleted' });
  })
  .catch(err => {
    console.error(err);
    res.status(500).json(err);
  });
});


module.exports = router;
