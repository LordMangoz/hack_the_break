// imports vs extention api
const vscode = require("vscode");

//fucntion for underlining

function html_validator() {
  vscode.workspace.onDidChangeTextDocument(() => {
    console.log("document changed");
  });
  //get the object of the current doucment

  //parse and check for a test case (a form without whatever) / maybe just activate the highlight function.
}

module.exports = { html_validator };
