-- References tracker_db results by query --

-- Department db query -- 

SELECT * FROM departments;

-- Role db query -- 

SELECT 
roles.id AS role_id,
roles.title,
roles.salary,
departments.name AS department_name
FROM roles
LEFT OUTER JOIN departments
ON roles.department_id = departments.id;

-- Employee db query -- 

SELECT
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
ON departments.id = roles.department_id