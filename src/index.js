const express = require("express");
const { v4: uuidV4 } = require("uuid");

const app = express();
app.use(express.json());

// Middleware
function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find(customer => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: "Customer not found!" });
  }

  request.customer = customer;

  return next();
}

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
}

const customers = [];

app.post("/account", (request, response) => {
  const { cpf, name } = request.body;

  const customerAlreadyExists = customers.some(
    customer => customer.cpf === cpf
  );

  if (customerAlreadyExists) {
    return response.status(400).json({ error: "Customer already exists!" });
  }

  customers.push({
    id: uuidV4(),
    cpf,
    name,
    statement: []
  });

  return response.status(201).send("Conta criada com sucesso!");
});

app.use(verifyIfExistsAccountCPF);

app.get("/account", (request, response) => {
  const { customer } = request;

  return response.json(customer);
});

app.put("/account", (request, response) => {
  const { name } = request.body;

  const { customer } = request;
  customer.name = name;

  return response.status(201).send("Account updated!");
});

app.delete("/account", (request, response) => {
  const { customer } = request;

  const indexCustomer = customers.findIndex(
    customerIndex => customerIndex.cpf === customer.cpf
  );
  customers.splice(indexCustomer, 1);

  return response.status(200).json(customers);
});

app.get("/statement", (request, response) => {
  const { customer } = request;
  return response.json(customer.statement);
});

app.get("/statement/date", (request, response) => {
  const { customer } = request;

  const { date } = request.query;

  const dateFormated = new Date(date + " 00:00");
  const statement = customer.statement.filter(statement => {
    statement.created_at.toDateString() ===
      new Date(dateFormated).toDateString();
  });

  return response.json(statement);
});

app.post("/deposit", (request, response) => {
  const { amount, description } = request.body;

  const { customer } = request;

  const statementOperations = {
    type: "credit",
    description,
    amount,
    created_at: new Date()
  };

  customer.statement.push(statementOperations);

  return response.status(201).send("Deposit done successfully!");
});

app.post("/withdraw", (request, response) => {
  const { amount } = request.body;

  const { customer } = request;
  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: "Insufficient funds!" });
  }

  const statementOperations = {
    type: "debit",
    amount,
    created_at: new Date()
  };

  customer.statement.push(statementOperations);
  return response.status(201).send("Successful withdrawal!");
});

app.get("/balance", (request, response) => {
  const { customer } = request;

  const balace = getBalance(customer.statement);

  return response.json(balace);
});

app.listen(3333, () => console.log("Server is running on port 3333"));
