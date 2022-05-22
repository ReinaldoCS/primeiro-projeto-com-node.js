const express = require('express');
const { v4: uuidv4 } = require('uuid');

app = express();

app.use(express.json());

const customers = [];

/**
 * CPF = string
 * name - string
 * id - uuid
 * statement []
 */

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

app.listen(3333, () => {
  console.log('listening on port: 3333');
});
