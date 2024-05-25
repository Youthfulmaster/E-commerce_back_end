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
  const { product_name, price, stock, category_id, tagIds } = req.body;
  
  Product.create({
    product_name,
    price,
    stock,
    category_id
  })
  .then((product) => {
    // If there are product tags, create pairings to bulk create in the ProductTag model
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
  .then((product) => res.status(200).json(product))
  .catch((err) => {
    console.error('Error:', err);
    res.status(400).json(err);
  });
});

router.put('/:id', (req, res) => {
  const { product_name, price, stock, category_id, tagIds } = req.body;
  
  // Update product data
  Product.update(
    {
      product_name,
      price,
      stock,
      category_id
    },
    {
      where: {
        id: req.params.id,
      },
    }
  )
  .then((product) => {
    if (product[0] === 0) {
      return res.status(404).json({ message: 'No product found with this id' });
    }

    if (tagIds && tagIds.length) {
      ProductTag.findAll({
        where: { product_id: req.params.id }
      }).then((productTags) => {
        // Create filtered list of new tag_ids
        const productTagIds = productTags.map(({ tag_id }) => tag_id);
        const newProductTags = tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });

        // Figure out which ones to remove
        const productTagsToRemove = productTags
          .filter(({ tag_id }) => !tagIds.includes(tag_id))
          .map(({ id }) => id);

        // Run both actions
        return Promise.all([
          ProductTag.destroy({ where: { id: productTagsToRemove } }),
          ProductTag.bulkCreate(newProductTags),
        ]);
      });
    }

    return res.json({ message: 'Product updated successfully' });
  })
  .catch((err) => {
    console.error('Error:', err);
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
