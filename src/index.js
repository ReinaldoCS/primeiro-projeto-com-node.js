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

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === 'credit') {
      return acc + operation.amount;
    } else { 
      return acc - operation.amount;
    }
  }, 0);

  return balance;
};

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

  response.status(201).json(customer.statement);
});

app.post('/deposit', verifyIfExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;
  const { customer } = request;

  const statementOperation = { 
    description, 
    amount,
    created_at: new Date(),
    type: "credit",
  };

  customer.statement.push(statementOperation);

  response.status(201).json(statementOperation);
})

app.post('/withdraw', verifyIfExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;
  const { customer } = request;
  const balance = getBalance(customer.statement);

  if(amount > balance) {
    return response.status(400).json({ error: 'Insufficient funds!' });
  };

  const statementOperation = {
    amount,
    description,
    created_at: new Date(),
    type: "debit",
  };

  customer.statement.push(statementOperation);

  response.status(201).json(statementOperation);
});

app.get('/statement/date', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  const dateFormat = new Date(date + " 00:00");

  const statement = customer.statement.filter(
    (statement) => 
      new Date(statement.created_at).toDateString() === 
      new Date(dateFormat).toDateString()
  );

  // console.log(new Date(dateFormat).toDateString())

  response.status(201).json(statement);
});

app.listen(3333, () => {
  console.log('listening on port: 3333');
});
