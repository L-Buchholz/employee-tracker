const express = require("express");
const mysql = require("mysql2");
//const sequelize = require("./config/connection");

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "password",
    database: "tracker_db",
  },
  console.log(`Connected to the tracker_db database.`)
);

/*
ALTERNATIVE CONNECTION TO DB -- ALSO REMOVE "Default response..." AT THE END

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
});

*/

// SUPPORTING GET/POST CODE BELOW

// Create a department
app.post("/api/departments", ({ body }, res) => {
  const sql = `INSERT INTO departments (name)
    VALUES (?)`;
  const params = [body.name];

  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "Department added!",
      data: body,
    });
  });
});

// Read all DEPARTMENTS
app.get("/api/departments", (req, res) => {
  const sql = `SELECT id, name AS name FROM departments`;

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
  const sql = `SELECT id, title AS title FROM roles`;

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

// Read all EMPLOYEES
app.get("/api/employees", (req, res) => {
  const sql = `SELECT id, first_name, last_name, role_id, manager_id AS employee info FROM employees`;

  db.query(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: "Employees uploaded and viewable",
      data: rows,
    });
  });
});

// TODO: Read list of all employees and associated JOB TITLE, DEPARTMENT,
// [cont'd] SALARY, and MANAGER THE EMPLOYEE REPORTS TO using LEFT JOIN
// [cont'd] "NULL" if no manager

app.get("/api/roles", (req, res) => {
  const sql = `SELECT employees.role_id AS role, roles.title FROM roles LEFT JOIN employees ON roles.id = employees.role_id ORDER BY employees.role_id;`;
  db.query(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: "Role query successful!",
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

// Delete an EMPLOYEE
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
