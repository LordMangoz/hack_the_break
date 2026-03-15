// imports vs extention api
const vscode = require("vscode");
// for each item, we need to store the number and the line count
const containerElements = [
  "div",
  "section",
  "article",
  "main",
  "nav",
  "aside",
  "header",
  "footer",
  "form",
  "ul",
  "ol",
  "li",
  "table",
];

const voidElements = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
];

const inlineElements = [
  "span",
  "a",
  "strong",
  "em",
  "b",
  "i",
  "label",
  "small",
  "code",
];

// need more conditionals for it running.
function html_validator(event) {
  const editor = vscode.window.activeTextEditor; //could be not open ->
  if (!editor) {
    vscode.window.showInformationMessage("!editor");
    return;
  }

  if (!event) {
    return;
  }

  const document = event.document;
  const text = document.getText();

  validate(text, document);
}

/**
 * contains the validation logic
 */
function validate(text, document) {
  if (!text) return;
  createElements(text, document);
  looseText(text);
  containerDiv(text, document);

  // parse and check for a test case (a form without whatever) / maybe just activate the highlight function.
  // parse through while checking for things in our list without a container div
}

function looseText(text) {}

//to check for container around something
function containerDiv(text, document) {
  return null;
}

//make an list of tag objects
function createElements(text, document) {
  const elements = [];
  const elementRegex = /<\/?([a-zA-Z0-9]+)(?:\s[^>]*)?>/g;

  //do a for of [iterates thru values of an iterator]
  for (const element of text.matchAll(elementRegex)) {
    const tag = {
      lineNumber: document.positionAt(element.index),
      tagName: element[0],
    };

    elements.push(tag);
  }
}

//to check for duplicate id

module.exports = { html_validator };

// match[0] = full matched string
// match[1] = first (...) capture
// match[2] = second (...) capture
