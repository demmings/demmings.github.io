/**
 * Read defaults (if any) from local storage and set current screen inputs using defaults.
 * The default is the last value in each prompt at the time of a SUBMIT request.
 */
function setDefaultSelect2QueryData() {
    const select2QueryData = localStorage.getItem("Select2Query");

    if (typeof select2QueryData !== 'undefined') {
        const myData = JSON.parse(select2QueryData);

        document.getElementById("sqlSelect").value = myData.sqlSelect;

        document.getElementById("table1").value = myData.table1;
        document.getElementById("range1").value = myData.range1;

        document.getElementById("table2").value = myData.table2;
        document.getElementById("range2").value = myData.range2;

        document.getElementById("table3").value = myData.table3;
        document.getElementById("range3").value = myData.range3;

        document.getElementById("table4").value = myData.table4;
        document.getElementById("range4").value = myData.range4;
    }
}


window.onload = function () { // Or window.addEventListener("load", function() {
    setDefaultSelect2QueryData();
}

/**
 * Called from page to read inputs and generate Sheets Query statement.
 */
function select2Query() {
    const sqlStatement = document.getElementById("sqlSelect").value;

    const sql = new Select2Query().setTables(document.getElementById("table1").value, document.getElementById("range1").value,
        document.getElementById("table2").value, document.getElementById("range2").value,
        document.getElementById("table3").value, document.getElementById("range3").value,
        document.getElementById("table4").value, document.getElementById("range4").value);

    const jsValue = sql.convert(sqlStatement);

    document.getElementById('output').value = jsValue;

    //  Save for default on refresh.
    const Select2QueryLocalStorage = {
        sqlSelect: document.getElementById("sqlSelect").value,
        table1: document.getElementById("table1").value,
        range1: document.getElementById("range1").value,
        table2: document.getElementById("table2").value,
        range2: document.getElementById("range2").value,
        table3: document.getElementById("table3").value,
        range3: document.getElementById("range3").value,
        table4: document.getElementById("table4").value,
        range4: document.getElementById("range4").value
    };
    const localJSON = JSON.stringify(Select2QueryLocalStorage);
    localStorage.setItem("Select2Query", localJSON);
}

