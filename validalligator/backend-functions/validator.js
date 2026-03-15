const vscode = require("vscode");
<<<<<<< HEAD
const { highlightWarning } = require("./html-highlighter.cjs"); // gotta actaully implement these btw
=======
const { highlightWarning } = require("./html-highlighter.cjs");
const { addError, clearErrors } = require("./error-storage.cjs");
>>>>>>> bf364207694bafbbcc5bd65df71eb105b945bb37
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
    return null;
  }

  const document = event.document;
  const text = document.getText();

  validate(text, document);
  return editor;
}

/**
 * contains the validation logic
 */
function validate(text, document) {
  if (!text) return;
  clearErrors();
  const docElements = createElements(text, document);

  // All the validators below
  divInsideSpan(docElements);
  //   looseText(text, docElements, document);
  containerDiv(docElements, document);
<<<<<<< HEAD
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
=======
  formWithoutSubmit(docElements);
  //   mismatchClosingString();
  attributeWithoutValue(docElements);
  duplicateAttributes(docElements);
  invalidChild(docElements);
  unclosedTag(docElements);
  multipleHeads(docElements);
  multipleBodies(docElements);
  missingParent(docElements);
  missNexted(docElements);
>>>>>>> bf364207694bafbbcc5bd65df71eb105b945bb37
}

//to check for container around something
function containerDiv(_docElements, _document) {
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

    while (parentStack.length > 0) {
      const top = parentStack[parentStack.length - 1];

      parentStack.pop();

      if (top.tagName === tag.tagName) break;
    }

    return;
  }

  if (voidElements.includes(tag.tagName)) return;

  if (parentStack.length > 0) {
    tag.parent = parentStack[parentStack.length - 1];
  }

  parentStack.push(tag);
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

  if (containerElements.includes(tag.tagName)) {
    tag.elementType = "container";
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
        const lineNum = element.PositionObject.line + 1;
        highlightWarning(lineNum);
        addError(
          lineNum,
          "Block element inside inline element",
          `The <${element.tagName}> tag is a block element and cannot be nested inside the inline <${element.parent.tagName}> tag. Move the <${element.tagName}> outside of the <${element.parent.tagName}>.`,
        );
      }
    }
  }
}

function formWithoutSubmit(docElements) {
  for (const element of docElements) {
    if (element.tagName === "form") {
      let foundSubmit = false;

      for (const child of docElements) {
        if (
          child.parent === element &&
          child.tagName === "input" &&
          child.raw.includes("submit")
        ) {
          foundSubmit = true;
        }
      }

      if (!foundSubmit) {
        const lineNum = element.PositionObject.line + 1;
        highlightWarning(lineNum);
        addError(
          lineNum,
          "Form missing submit button",
          `This <form> does not have a submit button. Add <input type="submit" value="Submit"> or <button type="submit">Submit</button> to allow users to submit the form.`,
        );
      }
    }
  }
}

// function mismatchClosingString() {}

//attribute without a value
function attributeWithoutValue(docElements) {
  // Regex to find attributes without values: space + word chars not followed by =
  const attrWithoutValueRegex = /\s([^\s=>\/]+)(?=\s|>)(?!\s*=)/g;

  for (const element of docElements) {
    if (element.elementType === "closing") continue;

    let match;
    while ((match = attrWithoutValueRegex.exec(element.raw)) !== null) {
      // Skip if it's a void element closing or at end of tag
      if (match[0].trim() === ">" || match[0].trim() === "/>") {
        continue;
      }
      // Highlight elements with valueless attributes
      const lineNum = element.PositionObject.line + 1;
      highlightWarning(lineNum);
      addError(
        lineNum,
        "Attribute missing value",
        `The attribute "${match[1]}" in the <${element.tagName}> tag does not have a value. All attributes must have a value. Example: <${element.tagName} ${match[1]}="value">.`,
      );
      break; // Only need to highlight once per element
    }
  }
}

function duplicateAttributes(docElements) {
  const attrRegex = /\s(\w+)(?=\s*=)/g;

  for (const element of docElements) {
    if (element.elementType === "closing") continue;

    const seen = new Set();
    let match;

    while ((match = attrRegex.exec(element.raw)) !== null) {
      const attr = match[1].toLowerCase();

      if (seen.has(attr)) {
        const lineNum = element.PositionObject.line + 1;
        highlightWarning(lineNum);
        addError(
          lineNum,
          "Duplicate attribute found",
          `The attribute "${attr}" appears more than once in the <${element.tagName}> tag. Each attribute should only be used once per element.`,
        );
        break;
      }

      seen.add(attr);
    }
  }
}

function invalidChild(docElements) {
  const childRules = {
    ul: ["li"],
    ol: ["li"],
    table: ["tbody", "thead", "tfoot", "tr"],
    tbody: ["tr"],
    thead: ["tr"],
    tfoot: ["tr"],
    tr: ["td", "th"],
  };

  for (const child of docElements) {
    const parent = child.parent;
    if (!parent) continue;

    const rules = childRules[parent.tagName];
    if (!rules) continue;

    if (!rules.includes(child.tagName)) {
      const lineNum = child.PositionObject.line + 1;
      highlightWarning(lineNum);
      addError(
        lineNum,
        "Invalid child element",
        `The <${child.tagName}> tag is not a valid child of <${parent.tagName}>. Valid children are: ${rules.map((t) => `<${t}>`).join(", ")}.`,
      );
    }
  }
}

// unclosed tag
function unclosedTag(docElements) {
  const stack = [];
  const seenTags = new Map(); // Track tag positions

  for (const element of docElements) {
    if (element.elementType === "closing" || element.elementType === "void") {
      if (element.elementType === "closing") {
        if (stack.length === 0) {
          const lineNum = element.PositionObject.line + 1;
          highlightWarning(lineNum);
          addError(
            lineNum,
            "Closing tag without opening tag",
            `Found a closing </${element.tagName}> tag with no matching opening tag. Remove the closing tag or add an opening <${element.tagName}> tag.`,
          );
          continue;
        }

        const top = stack[stack.length - 1];
        if (top.tagName === element.tagName) {
          stack.pop();
        } else {
          const lineNum = element.PositionObject.line + 1;
          highlightWarning(lineNum);
          addError(
            lineNum,
            "Mismatched closing tag",
            `The closing tag </${element.tagName}> does not match the most recent opening tag <${top.tagName}>. Check your tag nesting order.`,
          );
        }
      }
    } else {
      // Opening or inline tag
      const key = `${element.tagName}_${stack.length}`;
      seenTags.set(key, element);
      stack.push(element);
    }
  }

  // Only flag unclosed tags for important structural elements
  const importantTags = ["html", "body", "head", "form", "table", "ul", "ol"];
  for (const remaining of stack) {
    if (importantTags.includes(remaining.tagName)) {
      const lineNum = remaining.PositionObject.line + 1;
      highlightWarning(lineNum);
      addError(
        lineNum,
        "Unclosed tag",
        `The opening tag <${remaining.tagName}> is never closed. Add a closing </${remaining.tagName}> tag.`,
      );
    }
  }
}

//missing parent
function missingParent(_docElements) {}
//child in parent
function missNexted(_docElements) {}

//multiple head elements
function multipleHeads(docElements) {
  let headCount = 0;
  for (const tag of docElements) {
    if (tag.tagName === "head" && tag.elementType !== "closing") {
      headCount++;
    }
  }
  if (headCount > 1) {
    for (const tag of docElements) {
      if (tag.tagName === "head" && tag.elementType !== "closing") {
        const lineNum = tag.PositionObject.line + 1;
        highlightWarning(lineNum);
        addError(
          lineNum,
          "Multiple head elements found",
          `An HTML document should only have one <head> element. Found ${headCount} head elements total. Keep only one <head> and move all other content into it.`,
        );
      }
    }
  }
}

//multiple single only elements
function multipleBodies(docElements) {
  let count = 0;
  for (const tag of docElements) {
    if (tag.tagName === "body") {
      count++;
    }
  }
  if (count > 1) {
<<<<<<< HEAD
    //highlight all bodies
=======
    for (const tag of docElements) {
      if (tag.tagName === "body") {
        const lineNum = tag.PositionObject.line + 1;
        highlightWarning(lineNum);
        addError(
          lineNum,
          "Multiple body tags found",
          `An HTML document should only have one <body> tag. Found ${count} body tags total. Remove the extra <body> tags and ensure all content is within a single <body>.`,
        );
      }
    }
>>>>>>> bf364207694bafbbcc5bd65df71eb105b945bb37
  }
}

//to check for duplicate id
module.exports = { html_validator };

// match[0] = full matched string
// match[1] = first (...) capture
// match[2] = second (...) capture
