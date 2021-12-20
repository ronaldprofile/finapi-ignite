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

// app.use(verifyIfExistsAccountCPF);
app.get("/statement", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer.statement);
});

app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
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

app.listen(3333, () => console.log("Server is running on port 3333"));
