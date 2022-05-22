const express = require('express');
const { v4: uuidv4 } = require('uuid');

app = express();

app.use(express.json());

const customers = [];

// Middlewares
function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if(!customer) {
    response.status(404).json({ error: 'Customer not found'});
  };

  request.customer = customer;

  return next();
}

app.post('/account', (request, response) => {
  const { cpf, name } = request.body;

  const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf);

  if (customerAlreadyExists) {
    return response.status(400).json({ error: 'Customer already exists' });
  };

  customers.push({
    id: uuidv4(),
    cpf,
    name,
    statement: []
  });

  return response.status(200).json(customers);
});

/**
 * app.use(verifyIfExistsAccountCPF)
 * o Middlewares com app.use() é passado quando você deseja
 *  que todas as todas utilizem o determinado Middlewares
 */
app.get('/statement', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  response.json(customer.statement);
});

app.listen(3333, () => {
  console.log('listening on port: 3333');
});
