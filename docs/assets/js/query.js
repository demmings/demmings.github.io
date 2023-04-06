//export { select2Query };
//import { SqlParse } from "./SimpleParser.js";

function select2Query() {
    console.log("Submitted");

    const sqlStatement = document.getElementById("sqlSelect").value;

    let sql = new Select2Query().setTables(document.getElementById("table1").value, document.getElementById("range1").value,
        document.getElementById("table2").value, document.getElementById("range2").value,
        document.getElementById("table3").value, document.getElementById("range3").value,
        document.getElementById("table4").value, document.getElementById("range4").value);
        
    let jsValue = sql.convert(sqlStatement);
    
    document.getElementById('output').value = jsValue;
}

