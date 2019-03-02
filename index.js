const fs = require('fs'); 
const XMLparser = require('fast-xml-parser');
const Json2csvParser = require('json2csv').Parser;
const inquirer = require('inquirer'); 

// let fileIn = process.argv[2]; 
// let fileOut = process.argv[3]; 
// fileIn = 'sample'; //! TESTING
// fileOut = 'output'; //! TESTING

function start() {
    console.log('XML Converter');
    console.log('--------------------')
    inquirer.prompt([
        {
            type: "input",
            name: "fileIn",
            message: "XML filename: "
        },
        {
            type: "list",
            name: "fileType",
            message: "Convert XML to what file type?",
            choices: ["JSON", "CSV"]
        },
        {
            type: "input",
            name: "fileOut",
            message: "Output filename: "
        }
    ]).then(function(input) {
        toJSON(input.fileIn, input.fileOut, input.fileType)
    }); 

}

function toJSON(fileIn, fileOut, endFileType) {
    let jsonObj; 
    let jsonStr;
    let jsonReduced; 
    // let csvData; 
    let options = {
        attributeNamePrefix : "@_",
        attrNodeName: "attr", //default is 'false'
        textNodeName : "#text",
        ignoreAttributes : true,
        ignoreNameSpace : false,
        allowBooleanAttributes : false,
        parseNodeValue : true,
        parseAttributeValue : false,
        trimValues: true,
        cdataTagName: "__cdata", //default is 'false'
        cdataPositionChar: "\\c",
        localeRange: "", //To support non english character in tag/attribute values.
        parseTrueNumberOnly: false,
    };
    
    fs.readFile(`${fileIn}.xml`, "utf8", function(error, xmlData) {
        if (error) { return console.log(error); }
        let tObj = XMLparser.getTraversalObj(xmlData,options);
        jsonObj = XMLparser.convertToJson(tObj,options);
        jsonStr = JSON.stringify(jsonObj); 
        
        if(endFileType === 'JSON') {
            console.log('json')
            fs.writeFile(`${fileOut}.json`, jsonStr, function(err) {
                if (error) { return console.log(error); }
                console.log("New file updated");
            });
        } else if (endFileType === 'CSV') {
            checkForNextLevel(jsonObj)
        } else {
            console.log('No file selection'); 
        }

     
        function checkForNextLevel(jsonObj) {
            for(var propName in jsonObj) {
                if(jsonObj.hasOwnProperty(propName) && !jsonObj.length) {
                    jsonObj = jsonObj[propName]
                    checkForNextLevel(jsonObj); 
                } else {
                    jsonReduced = jsonObj; 
                    toCSV(jsonReduced); 
                    return jsonReduced;
                }
            }
        }

        function toCSV(jsonReduced) {
            let fields = [];
            for(var key in jsonReduced[0]) {
                fields.push(key);
            }        
        
            const json2csvParser = new Json2csvParser({ fields });
            const csv = json2csvParser.parse(jsonReduced);
        
            fs.writeFile(`${fileOut}.csv`, csv, function(error) {
                if (error) { return console.log(error); }
                console.log("New file updated");
            });
        }
    }); 
}

start();