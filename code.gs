function doGet(e) {
  return HtmlService.createTemplateFromFile("index.html")
    .evaluate()
}

function getChartData() {

  const data = [];
  const sh = SpreadsheetApp.getActive().getSheetByName('Sheet1');
  const values = sh.getRange(1 +1, 2, sh.getLastRow() -1, 2).getValues();

Logger.log(values)

  const mapTree = values.reduce((map, [fruit, orchard]) => {
    if (!map.has(orchard)) map.set(orchard, new Map());
    let fruitMap = map.get(orchard);
    let fruitCount = fruitMap.get(fruit) || 0;
    fruitMap.set(fruit, ++fruitCount);
    return map;
  }, new Map());

  mapTree.forEach((fruitMap, orchard) => {
    const obj = { orchard };
    data.push(obj);
    for (const [fruit, fruitCount] of fruitMap) obj[fruit] = fruitCount;
  });
  
  return data;
}

function callWithHTML(){

  var day = Utilities.formatDate(new Date(), "GMT+1", "MMM-dd-yyyy")
  var d = new Date();
  var timeStamp = d.getTime();
  
  var currentTime = d.toLocaleTimeString();
  
  return Session.getActiveUser().getEmail() + " " + day + " at " + currentTime;
  
}
