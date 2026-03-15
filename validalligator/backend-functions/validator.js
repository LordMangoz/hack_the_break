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

//add more
const textContain = ["p", "label"];

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
  const docElements = createElements(text, document);
  looseText(text, docElements, document);
  containerDiv(text, document);

  // parse and check for a test case (a form without whatever) / maybe just activate the highlight function.
  // parse through while checking for things in our list without a container div
}

function looseText(text, docElements, document) {
  //if there is text not between elements in .
  // const elementRegex = /<\/?([a-zA-Z0-9]+)(?:\s[^>]*)?>/g;

  //maybe have to exclude if its between tags.
  const looseRegex = /([a-zA-Z0-9]+)/g;
  //look for text. check if line number of text is between two existing line containing divs.

  //loop for text
  for (const looseText of text.matchAll(looseRegex)) {
    //for each "loose text" if between / on

    //if the index is between<longner paragrapth??> or on a line(<p>) where there is a valid tag, its good
    //check if the thing is between or at the line number of elements that can contain text.
    if (document.positionAt(looseText.index)) {
    }
  }
}

//to check for container around something
function containerDiv(text, document) {
  return null;
}

//make an list of tag objectsr
function createElements(text, document) {
  const parentStack = [];
  const elements = [];
  const elementRegex = /<\/?([a-zA-Z0-9]+)(?:\s[^>]*)?>/g;

  //do a for of [iterates thru values of an iterator]
  for (const element of text.matchAll(elementRegex)) {
    const raw = element[0];
    const tagName = element[1].toLowerCase();
    const isClosing = raw.startsWith("</");

    const tag = {
      lineNumber: document.positionAt(element.index),
      tagName: tagName,
      containText: false,
      elementType: "",
      parent: null,
    };

    setElementType(tag, isClosing);
    setParent(tag, isClosing, parentStack);
    setContainText(tag);
    elements.push(tag);
  }
  return elements;
}
function setParent(tag, isClosing, parentStack) {
  if (isClosing) {
    parentStack.pop();
    return;
  }

  if (parentStack.length > 0) {
    tag.parent = parentStack[parentStack.length - 1];
  }

  if (!voidElements.includes(tag.tagName)) {
    parentStack.push(tag);
  }
}

function setContainText(tag) {
  if (textContain.includes(tag.tagName)) {
    tag.containText = true;
  }
}

function setElementType(tag, isClosing) {
  if (isClosing) {
    tag.elementType = "closing";
    return;
  }

  if (voidElements.includes(tag.tagName)) {
    tag.elementType = "void";
    return;
  }

  if (inlineElements.includes(tag.tagName)) {
    tag.elementType = "inline";
    return;
  }

  tag.elementType = "open";
}
//block inside inline
function divInsideSpan() {
  // if block opening inside a span.
}

//might skip
function formWithoutSubmit(text, document) {
  const diagnostics = [];
  // form tag
  const formRegex = /<form[^>]*>([\s\S]*?)<\/form>/gi;

  for (const form of text.matchAll(formRegex)) {
    const formContent = form[1];
    const formStartIndex = form.index;

    // if form contains a submit button or input
    const submitRegex =
      /<button[^>]*type\s*=\s*['"]?submit['"]?[^>]*>|<input[^>]*type\s*=\s*['"]submit['"][^>]*>/i;

    if (!submitRegex.test(formContent)) {
      const lineNumber = document.positionAt(formStartIndex).line;
      const range = new vscode.Range(
        new vscode.Position(lineNumber, 0),
        new vscode.Position(lineNumber, form[0].length),
      );

      const diagnostic = new vscode.Diagnostic(
        range,
        "Form element missing submit button!!!!! Add a submit button or input to fix.",
        vscode.DiagnosticSeverity.Warning,
      );
      diagnostic.source = "ValidAlligator";
      diagnostics.push(diagnostic);
    }
  }

  return diagnostics;
}

//attribute without a value
function attributeWithoutValue() {}

//lower priorty
function duplicateAttributes() {}

function invalidChild() {}

// unclosed tag
function unclosedTag() {}

//missing parten
function missingParent() {}
//child in partent
function incorrectnexting() {}

//mulptle single only elemtns
function multipleBodies() {}

//to check for duplicate id
module.exports = { html_validator };

// match[0] = full matched string
// match[1] = first (...) capture
// match[2] = second (...) capture
