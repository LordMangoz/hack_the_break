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

  highlightWarning(1);

  // All the validators below
  divInsideSpan(docElements);
  looseText(text, docElements, document);
  containerDiv(docElements, document);
  formWithoutSubmit(docElements);
  //   mismatchClosingString();
  attributeWithoutValue(docElements);
  duplicateAttributes(docElements);
  invalidChild(docElements);
  unclosedTag(docElements);
  missingParent(docElements);
  missNexted(docElements);
  multipleBodies(docElements);
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
  // for( const element of docElements )
  // {
  //     if(element.type == "open"))
  //     {
  //     }
  //     if(element.type == "void")
  // }
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
      raw: raw,
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
function divInsideSpan(docElements) {
  for (const element of docElements) {
    // if current element is a block/container element
    if (containerElements.includes(element.tagName)) {
      // if parent is an inline element
      if (element.parent && inlineElements.includes(element.parent.tagName)) {
        // Block element found inside inline element violation
        highlightWarning(element.PositionObject);
      }
    }
  }
}

//might skip
function formWithoutSubmit(docElements) {
  for (const element of docElements) {
    if (!(element.tagName == "form")) //contains form
    {
      return;
    }
  }
}

// function mismatchClosingString() {}

//attribute without a value
function attributeWithoutValue(docElements) {
  // Regex to find attributes without values: space + word chars not followed by =
  const attrWithoutValueRegex = /\s(\w+)(?!\s*=)(?:\s|>|\/?>)/g;

  for (const element of docElements) {
    if (element.elementType === "closing") continue;

    let match;
    while ((match = attrWithoutValueRegex.exec(element.raw)) !== null) {
      // Skip if it's a void element closing or at end of tag
      if (match[0].trim() === ">" || match[0].trim() === "/>") {
        continue;
      }
      // Highlight elements with valueless attributes
      highlightWarning(element.PositionObject);
      break; // Only need to highlight once per element
    }
  }
}

//lower priorty
function duplicateAttributes(docElements) {
  // Regex to find all attributes: word chars followed by optional =value
  const attrRegex = /\b(\w+)(?:\s*=\s*["']?[^"'\s>]*["']?)?/g;

  for (const element of docElements) {
    if (element.elementType === "closing") continue;

    const seenAttributes = new Set();
    let match;

    while ((match = attrRegex.exec(element.raw)) !== null) {
      const attrName = match[1].toLowerCase();

      // Skip the tag name itself (first match)
      if (match.index === 0 || attrName === element.tagName) continue;

      // Check if we've already seen this attribute
      if (seenAttributes.has(attrName)) {
        highlightWarning(element.PositionObject);
        break; // Only need to highlight once per element
      }

      seenAttributes.add(attrName);
    }
  }
}

function invalidChild(docElements) {
  // define rules for valid children per parent element
  const childRules = {
    ul: ["li"],
    ol: ["li"],
    table: ["tbody", "thead", "tfoot", "tr"],
    tbody: ["tr"],
    thead: ["tr"],
    tfoot: ["tr"],
    tr: ["td", "th"],
  };

  for (const element of docElements) {
    if (childRules[element.tagName]) {
      const validChildren = childRules[element.tagName];

      // Check each child of this element
      for (const child of docElements) {
        if (child.parent === element) {
          // If child is not in the valid children list, highlight it
          if (!validChildren.includes(child.tagName)) {
            highlightWarning(child.PositionObject);
          }
        }
      }
    }
  }
}

// unclosed tag
function unclosedTag(docElements) {}

//missing parent
function missingParent(docElements) {}

//child in parent
function missNexted(docElements) {}
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
