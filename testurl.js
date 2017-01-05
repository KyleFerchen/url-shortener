var testUrl = function testString(testStr) {
  if (testStr.slice(0, 7) == "http://" || testStr.slice(0,8) == "https://") {
    if (testStr.search(/\./) !== -1) {
      return true;
    }
    else {
      console.log("url not valid, no period");
      return false;
    }
  }
  else {
    console.log("url not valid, no http or https");
    return false;
  }
}

module.exports = {
  test: testUrl
}
