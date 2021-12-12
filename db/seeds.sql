INSERT INTO departments (id, name)
VALUES (1, "Management"),
       (2, "Finance"),
       (3, "Engineering"),
       (4, "Sales"),
       (5, "Administrative"),


INSERT INTO roles (id, title, salary, department_id)
VALUES (1, "CEO", 170000, 1),
       (2, "CFO", 160000, 2),
       (3, "HR Supervisor", 130000, 5),
       (4, "Lead Engineer", 160000, 3),
       (5, "Sales Department Lead", 120000, 4)
       -- Following roles report to the above --
       (6, "Engineer", 110000, 3)
       (7, "Sales Assistant", 80000, 4),
       (8, "Accounting", 80000, 2)
       (9, "Office Assistant", 65000, 5)

INSERT INTO employees (id, first_name, last_name, role_id, manager_id)
VALUES ("Lauren", "Buchholz", 1, NULL),
       ("Tanner", "Stirrat", 4, NULL),
       ("Kris", "Mattera", 3, NULL),
       ("Emily", "VanGerpen", 2, NULL),
       -- "10" = REF CFO ID -- 
       ("Example Accounting", 8, 10)
       -- "11" = SELF-REFERENCE LEAD ENGINEER ID --
       ("Example Engineer", 6, 11),
       -- "12" = SELF-REFERENCE SALES DEPT LEAD ID -- 
       ("Example Sales", 7, 12),
       -- "13" = SELF-REFERENCE HR LEAD ID -- 
       ("Example Office", 9, 13);