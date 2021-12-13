const express = require("express");
const inquirer = require("inquirer");
const mysql = require("mysql2");
const fs = require("fs/promises");
const cTable = require("console.table");
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
    }
    /* } else if (response.options === "view-roles") {
      return viewRoles();
    } else {
      return generateHtml();
    }
    */
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

// Read all DEPARTMENTS
app.get("/api/departments", (req, res) => {
  const sql = `SELECT id, name FROM departments`;

  db.query(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: "Departments uploaded and viewable",
      data: rows,
    });
  });
});

// Create a ROLE
app.post("/api/roles", ({ body }, res) => {
  const sql = `INSERT INTO roles (title)
    VALUES (?)`;
  const params = [body.title];

  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "Role added!",
      data: body,
    });
  });
});

// Read all ROLES
app.get("/api/roles", (req, res) => {
  const sql = `SELECT 
  roles.id AS role_id,
  roles.title,
  roles.salary,
  departments.name AS department_name
  FROM roles
  LEFT OUTER JOIN departments
  ON roles.department_id = departments.id`;

  db.query(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: "Roles uploaded and viewable",
      data: rows,
    });
  });
});

// Create an EMPLOYEE
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

// Read list of all employees and associated JOB TITLE, DEPARTMENT,
// [cont'd] SALARY, and MANAGER THE EMPLOYEE REPORTS TO using LEFT JOIN
// [cont'd] "NULL" if no manager
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

//Update an EMPLOYEE

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
