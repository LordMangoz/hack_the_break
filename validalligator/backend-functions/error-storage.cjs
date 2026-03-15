const errors = new Map(); // Map<lineNumber, errorDetails>

function addError(lineNum, title, message, severity = "warning") {
  errors.set(lineNum, {
    lineNumber: lineNum,
    title: title,
    message: message,
    severity: severity,
    timestamp: new Date().toISOString(),
  });
}

function getError(lineNum) {
  return errors.get(lineNum);
}

function getAllErrors() {
  return Array.from(errors.values());
}

function clearErrors() {
  errors.clear();
}

module.exports = {
  addError,
  getError,
  getAllErrors,
  clearErrors,
};
