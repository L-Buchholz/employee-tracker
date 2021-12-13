const express = require("express");
const inquirer = require("inquirer");
const mysql = require("mysql2");
const fs = require("fs/promises");
const cTable = require("console.table");
const { runInNewContext } = require("vm");
require("dotenv").config();

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const db = connection.promise();

// SUPPORTING GET/POST CODE BELOW
const listOptions = [
  {
    type: "list",
    message: "Please select from one of the following options:",
    choices: [
      { value: "view-departments", name: "View all departments" },
      { value: "view-roles", name: "View all roles" },
      { value: "view-employees", name: "View all employees" },
      { value: "add-department", name: "Add a department" },
      { value: "add-role", name: "Add a role" },
      { value: "add-employee", name: "Add an employee" },
      { value: "update-employee", name: "Update an employee" },
      { value: "finish", name: "Finish and exit" },
    ],
    name: "options",
  },
];

//Initiates list options prompt
function promptForOptions() {
  return inquirer.prompt(listOptions).then((response) => {
    if (response.options === "view-departments") {
      return viewDepartments();
    } else if (response.options === "add-department") {
      return addDepartment();
    } else if (response.options === "view-roles") {
      return viewRoles();
    } else if (response.options === "add-role") {
      return addRole();
    }
  });
}

//Initiates viewDepartments
function viewDepartments() {
  const sql = `SELECT id, name FROM departments`;
  return db
    .query(sql)
    .then(([rows]) => {
      console.log(cTable.getTable(rows));
    })
    .then(promptForOptions);
}

// Create a department
function addDepartment() {
  const sql = `INSERT INTO departments (name)
    VALUES (?)`;
  return inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of your department?",
        name: "name",
      },
    ])
    .then((res) => db.query(sql, [res.name]))
    .then(promptForOptions);
}

// Create a role
function addRole() {
  const department = `SELECT id, name FROM departments`;
  const sql = `INSERT INTO roles (title, salary, department_id)
    VALUES (?, ?, ?)`;
  return db
    .query(department)
    .then(([rows]) =>
      inquirer.prompt([
        {
          type: "input",
          message: "What is the name of this role?",
          name: "name",
        },
        {
          type: "input",
          message: "What is this role's salary?",
          name: "salary",
        },
        {
          type: "list",
          message: "Select a department for this role:",
          name: "department",
          choices: rows.map((row) => ({
            name: row.name,
            value: row.id,
          })),
        },
      ])
    )
    .then((res) => db.query(sql, [res.name, res.salary, res.department]))
    .then(promptForOptions);
}

// View all roles
function viewRoles() {
  const sql = `SELECT 
  roles.id AS role_id,
  roles.title,
  roles.salary,
  departments.name AS department_name
  FROM roles
  LEFT OUTER JOIN departments
  ON roles.department_id = departments.id`;
  return db
    .query(sql)
    .then(([rows]) => {
      console.log(cTable.getTable(rows));
    })
    .then(promptForOptions);
}

// Create an employee
// UPDATE CODE

app.post("/api/employees", ({ body }, res) => {
  const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id)
    VALUES (?)`;
  const params = [
    body.first_name,
    body.last_name,
    body.role_id,
    body.manager_id,
  ];

  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "Employee added!",
      data: body,
    });
  });
});

// View all employees
// UPDATE CODE

app.get("/api/employees", (req, res) => {
  const sql = `SELECT
  employees.id AS employee_id,
  employees.first_name,
  employees.last_name,
  roles.title AS role_name,
  roles.salary,
  departments.name AS department_name,
  managers.first_name AS manager_first_name
  FROM employees
  LEFT OUTER JOIN roles
  ON employees.role_id = roles.id
  LEFT OUTER JOIN employees AS managers
  ON employees.manager_id = employees.id
  LEFT OUTER JOIN departments
  ON departments.id = roles.department_id`;
  db.query(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: "Employee query successful!",
      data: rows,
    });
  });
});

// ADDITIONAL UPDATE EMPLOYEE POTENTIAL CODE:

app.put("/api/update-employee/:id", (req, res) => {
  const sql = `UPDATE employees SET employee = ? WHERE id = ?`;
  const params = [req.body.review, req.params.id];

  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else if (!result.affectedRows) {
      res.json({
        message: "Employee not found",
      });
    } else {
      res.json({
        message: "Employee successfully updated!",
        data: req.body,
        changes: result.affectedRows,
      });
    }
  });
});

// BONUS: Delete an EMPLOYEE
app.delete("/api/employees/:id", (req, res) => {
  const sql = `DELETE FROM employees WHERE id = ?`;
  const params = [req.params.id];

  db.query(sql, params, (err, result) => {
    if (err) {
      res.statusMessage(400).json({ error: res.message });
    } else if (!result.affectedRows) {
      res.json({
        message: "Employee not found",
      });
    } else {
      res.json({
        message: "Employee removed from database",
        changes: result.affectedRows,
        id: req.params.id,
      });
    }
  });
});

// End supporting GET/POST code

// To complete request: Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

promptForOptions();
