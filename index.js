const inquirer = require("inquirer");
const cTable = require("console.table");

const fs = require("fs");

//inquirer.prompt(questionList).then(response => db.query(query, params)).then(nextQuestion)
/*COPY/PASTE FROM OTHER ASSIGNMENT:
function menuPrompt() {}
function departmentPrompt() {}
*/

db.query("select * from employees").then((employees) => inquirer.prompt());

//UPDATE EVERYTHING BELOW HERE

/*Array of user input questions*/
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
  },
];

//Initiates list options prompt
function promptForOptions() {
  return inquirer.prompt(listOptions).then((response) => {
    if (response.options === "view-departments") {
      return viewDepartments();
      /*} else if (response.options === "view-roles") {
      return viewRoles();
    } else {
      return generateHtml();
    }
    */
    }
  });
}

//Initiates viewDepartments
function viewDepartments() {
  return;
}

//
//
//
//
//
//

const engineerQuestions = [
  {
    type: "input",
    message: "What is your engineer's name?",
    name: "name",
  },
  {
    type: "input",
    message: "Please enter an employee ID:",
    name: "id",
  },
  {
    type: "input",
    message: "Please enter a valid email address for this employee:",
    name: "email",
  },
  {
    type: "input",
    message: "Please enter the engineer's GitHub username:",
    name: "gitHub",
  },
];

const internQuestions = [
  {
    type: "input",
    message: "What is your intern's name?",
    name: "name",
  },
  {
    type: "input",
    message: "Please enter an employee ID:",
    name: "id",
  },
  {
    type: "input",
    message: "Please enter a valid email address for this intern:",
    name: "email",
  },
  {
    type: "input",
    message: "Please enter the intern's affiliated school:",
    name: "school",
  },
];

//Initiates Manager prompt questions
function promptForManager() {
  //"Return" saves Promise (responses) after following function is run
  return inquirer.prompt(managerQuestions).then((response) => {
    const manager = new Manager(
      response.name,
      response.id,
      response.email,
      response.office
    );
    team.push(manager);
    return promptForOptions();
  });
}

//Initiates Engineer prompt questions
function promptForEngineer() {
  //"Return" saves Promise (responses) after following function is run
  return inquirer.prompt(engineerQuestions).then((response) => {
    const engineer = new Engineer(
      response.name,
      response.id,
      response.email,
      response.gitHub
    );
    team.push(engineer);
    return promptForOptions();
  });
}

//Initiates Intern prompt questions
function promptForIntern() {
  //"Return" saves Promise (responses) after following function is run
  return inquirer.prompt(internQuestions).then((response) => {
    const intern = new Intern(
      response.name,
      response.id,
      response.email,
      response.school
    );
    team.push(intern);
    return promptForOptions();
  });
}

//Function for generating HTML

function generateHtml() {
  const htmlString = fs.readFileSync("index.html", "utf8");
  const output = team
    .map((member) => {
      return member.render();
    })
    .join("");
  const templateHtml = htmlString.replace(
    "<!--THIS IS THE INSERTION POINT-->",
    //Replace with the following:
    output
  );
  fs.writeFileSync("../dist/index.html", templateHtml);
}

/* The above .map... is an abbreviated way of saying this: 
{
    if (member instanceof Manager) {
      return member.render();
    }
    if (member instanceof Engineer) {
      return member.render();
    }
    if (member instanceof Intern) {
      return member.render();
    }
  }
*/

//Runs first function results and then moves to subsequent functions
promptForManager();
