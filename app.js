const express = require('express');

const app = express();
const port = process.env.PORT || "8080";

const products = [];

const loadProducts = async () => {
  try {
    const response = await fetch('https://fakestoreapi.com/products', {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    products.push(...data);
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

loadProducts();

const generateProductCard = (product) => {
  return `
    <div class="card bg-base-100 w-96 shadow-xl">
      <figure>
        <img src="${product.image}" alt="${product.title}" />
      </figure>
      <div class="card-body">
        <h2 class="card-title">${product.title}</h2>
        <p>Price: $${product.price}</p>
        <div class="card-actions justify-end">
          <a class="btn btn-primary" hx-get="/products/${product.id}" hx-push-url="true" hx-target="#products">View Product</a>
        </div>
      </div>
    </div>
  `;
}

app.use(express.static('static'));

app.get('/', async (req, res) => {
  res.sendFile('index.html', { root: 'basic' });
});

app.get('/search', async (req, res) => {
  const searchTerm = req.query.search;
  let matchingProducts = products;

  if (searchTerm) {
    matchingProducts = matchingProducts.filter(product => product.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  const html = matchingProducts.map(generateProductCard).join('');

  return res.send(html);
});


app.get('/products', async (req, res) => {
  const html = products.map(generateProductCard).join('');

  return res.send(html);
});

app.get('/products/:id', async (req, res) => {
  const productId = req.params.id;
  const product = products.find(product => product.id == productId);

  if (!product) {
    return res.send('<div>Product not found</div>');
  }

  const html = `
    <div>
      <h2>${product.title}</h2>
      <img src="${product.image}" alt="${product.title}" />
      <p>${product.description}</p>
      <p>Price: $${product.price}</p>
    </div>
  `;

  return res.send(html);
});

app.get('/count', async (req, res) => {
  const searchTerm = req.query.search;
  let matchingProducts = products;

  if (searchTerm) {
    matchingProducts = matchingProducts.filter(product => product.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  return res.send(`<div class="px-4 py-4">Number of products: ${matchingProducts.length}</div>`);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
