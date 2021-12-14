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
    }
    if (response.options === "add-department") {
      return addDepartment();
    }
    if (response.options === "view-roles") {
      return viewRoles();
    }
    if (response.options === "add-role") {
      return addRole();
    }
    if (response.options === "view-employees") {
      return viewEmployees();
    }
    if (response.options === "add-employee") {
      return addEmployee();
    }
    if (response.options === "update-employee") {
      return updateEmployee();
    }
    if (response.options === "finish") {
      return;
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

function addEmployee() {
  const roleTable = `SELECT id, title FROM roles`;
  const employeeTable = `SELECT id, first_name, last_name FROM employees`;
  const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id)
    VALUES (?, ?, ?, ?)`;
  return db
    .query(roleTable)
    .then(([roles]) =>
      db.query(employeeTable).then(([employees]) =>
        inquirer.prompt([
          {
            type: "input",
            message: "What is the employee's first name?",
            name: "first",
          },
          {
            type: "input",
            message: "What is the employee's last name?",
            name: "last",
          },
          {
            type: "list",
            message: "Select the employee's job title:",
            name: "role",
            choices: roles.map((role) => ({
              name: role.title,
              value: role.id,
            })),
          },
          {
            type: "list",
            message: "Select a manager if applicable:",
            name: "manager",
            choices: [
              { name: "No manager", value: null },
              // Incorporates the following mapped values into the above "choices" array (same level as "No manager", null)
              ...employees.map((manager) => ({
                name: `${manager.first_name} ${manager.last_name}`,
                value: manager.id,
              })),
            ],
          },
        ])
      )
    )
    .then((res) => db.query(sql, [res.first, res.last, res.role, res.manager]))
    .then(promptForOptions);
}

// View all employees

function viewEmployees() {
  const sql = `SELECT
  employees.id AS employee_id,
  employees.first_name,
  employees.last_name,
  roles.title AS role_name,
  roles.salary,
  departments.name AS department_name,
  managers.first_name AS manager_first_name,
  managers.last_name AS manager_last_name
  FROM employees
  JOIN roles
  ON employees.role_id = roles.id
  LEFT JOIN employees AS managers
  ON employees.manager_id = managers.id
  JOIN departments
  ON departments.id = roles.department_id`;
  return db
    .query(sql)
    .then(([rows]) => {
      console.log(cTable.getTable(rows));
    })
    .then(promptForOptions);
}

// Update employee

function updateEmployee() {
  const roleTable = `SELECT id, title FROM roles`;
  const employeeTable = `SELECT id, first_name, last_name FROM employees`;
  // SQL syntax (below): Update role where employee id = [user input]
  const sql = `UPDATE employees SET role_id = ? WHERE id = ?`;
  return (
    db
      .query(roleTable)
      .then(([roles]) =>
        db.query(employeeTable).then(([employees]) =>
          inquirer.prompt([
            {
              type: "list",
              message: "Select the employee to be updated:",
              name: "employee",
              choices: employees.map((employee) => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id,
              })),
            },
            {
              type: "list",
              message: "Select a new job title:",
              name: "role",
              choices: roles.map((role) => ({
                name: role.title,
                value: role.id,
              })),
            },
          ])
        )
      )
      // The following MUST follow the "const sql = [syntax]": Role ID FIRST, then employee ID
      .then((res) => db.query(sql, [res.role, res.employee]))
      .then(promptForOptions)
  );
}

// End supporting GET/POST code

// To complete request: Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

promptForOptions();
