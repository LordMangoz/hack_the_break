const vscode = require("vscode");
const { highlightWarning } = require("./html-highlighter.cjs"); // gotta actaully implement these btw
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
  containerDiv(docElements, document);
  highlightWarning(1);
  // parse and check for a test case (a form without whatever) / maybe just activate the highlight function.
  // parse through while checking for things in our list without a container div
}

function looseText(text, docElements, document) {
  const looseRegex = /([a-zA-Z0-9]+)/g;

  for (const looseText of text.matchAll(looseRegex)) {
    if (document.positionAt(looseText.index)) {
      if (!looseText.parent.containText) {
        //call highlighter.
        highlightWarning(docElements[looseText.index]);
      }
    }
  }
}

//to check for container around something
function containerDiv(docElements, document) {
    for( const element of docElements )
    {
        if(element.type == "open"))
        {

        }
        if(element.type == "void")
    }
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
      PositionObject: document.positionAt(element.index),
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
    if (parentStack.length === 0) return;
    const top = parentStack[parentStack.length - 1];
    parentStack.pop();
    return;
  }

  if (voidElements.includes(tag.tagName)) {
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
function formWithoutSubmit() {}

function mismatchClosingString() {}

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
function multipleBodies(docElements) {
  let count = 0;
  for (const tag of docElements) {
    if (tag.tagName === "body") {
      count++;
    }
  }
  if (count > 1) {
    //highlight all bodies
  }
}

//to check for duplicate id
module.exports = { html_validator };

// match[0] = full matched string
// match[1] = first (...) capture
// match[2] = second (...) capture
