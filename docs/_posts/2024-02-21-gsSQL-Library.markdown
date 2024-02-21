---
layout: default
title:  "Using gsSQL Library"
date:   2024-02-15 08:00:00 -0500
categories: [gsSQL]

keywords:
  - SQL
  - QUERY
  - SELECT
  - gsSQL
  - LIBRARY
---

# gsSQL Library

* Rather than copy the source for gsSQL and paste into your application, you can add this project as a library.
* The **gsSQL** function can be installed using the **Extensions ==> Apps Script ==> Libraries +**

<kbd>
<img src="/img/addLibrary.png" alt="Add Library" width="400"/>
</kbd>

* Add a **Script ID**
  * The following SCRIPT ID is for version 1 of the released library.
    * **1ZfedAgGG2K5kPLC2NPfe0Kb1xAg-0gvmliR3V8pRNk6DZMTUQyCbMW1W**


* Click on **Look up**

<kbd>
<img src="/img/libraryLookup.png" alt="Library Lookup" width="400"/>
</kbd>

* Now click **Add**

* At this point you can reference the library inside of your Javascript code like:
```
function myFunction() {
  gsSqlLibrary.gsSQL("select * from authors");  
}
```

* Click on the diskette icon to save.
* Now try to execute by clicking **Run**

<kbd>
<img src="/img/reviewPermissions.png" alt="Review Permissions" width="400"/>
</kbd>

* Choose your account to run under.  Here is my option.

<kbd>
<img src="/img/chooseAccount.png" alt="Choose Account" width="400"/>
</kbd>

* Click on **Advanced**

<kbd>
<img src="/img/googleWarning.png" alt="Google Warning" width="500"/>
</kbd>

* Then click on **Go to Untitled project (unsafe)**  (if you changed your project name, it will be different name)

<kbd>
<img src="/img/allowAccess.png" alt="Allow Access" width="500"/>
</kbd>

* Click **Allow**
* The program will run and give an error because we don't have the table **Authors**

```
Error: Error reading table data: AUTHORS
```

* You can now use the library within your javascript code as needed.
* However, the addition of the **gsSqlLibrary** library does not automatically provide a new custom function that is available within your spreadsheet.
* After adding the library to your project, add the following code to **Code.js** (or any file of your chossing.)

```
/**
 * @param {String} sqlStatement - e.g. "select * from authors"
 * @param {...any} parms - Optional ["tableName", range, "tableName2", range2,...][addTitle][bindVariables]
 * @returns {any[][]}
 * @customfunction
 */
function gsSQL(sqlStatement, ...parms) {
  return gsSqlLibrary.gsSQL(sqlStatement, ...parms);
}
```

* At this point you will be able to use **=gsSQL()** custom function within your sheet.

