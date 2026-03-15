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
        if (document.positionAt(looseText.index) == ) 
        {

        }

  }
}

//to check for container around something
function containerDiv(text, document) {
  return null;
}

//make an list of tag objectsr
function createElements(text, document) {
  const elements = [];
  const elementRegex = /<\/?([a-zA-Z0-9]+)(?:\s[^>]*)?>/g;

  //do a for of [iterates thru values of an iterator]
  for (const element of text.matchAll(elementRegex)) {
    const tag = {
      lineNumber: document.positionAt(element.index),
      tagName: element[0],
      containText : true,
      elementType: "",
      parent: "";
    };
    setElementType(tag);
    setContainText(tag);
    setParent(tag, elements[elements.length - 1])
    elements.push(tag);
  }
  return elements;
}
function setParent(tag, elements)
{

}
function setContainText(tag) 
{
    if(textContain.includes(tag.containText))
    {
        tag.containText = true; 
    }
}
function setElementType(tag)
{
    //belongs to vvoid or inline or closing, else open
    // might need to trim the names but we will see.
    if(voidElements.includes(tag.tagName))
    {
        tag.elementType = "void"; 
    } else if(inlineElements.includes(tag.tagName))
    {
        tag.elementType = "inline"; 
    } else if(tag.tagName.includes("</"))
    {
        tag.elementType = "closing"; 
    } else {
        tag.elementType = "open"; 
    }

    
}

//block inside inline
function divInsideSpan() {
    // if block opening inside a span.
}

//might skip
function formWithoutSubmit() {}

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
