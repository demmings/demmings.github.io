---
layout: default
title:  "Custom Function Triggered on Data Changes"
date:   2023-03-08 08:00:00 -0500
categories: [New Feature, gsSQL]

keywords:
  - SQL
  - TRIGGER
---

# Table Update Now Triggers Custom Function 

* There are normally two reasons that a custom function will run.
  * Sheet is reloaded.
  * A cell reference or range used as a input parameter has information in that cell or range changed.
* String or Number constant data would obviously never trigger the function to refresh.  
  * In the previous version of gsSQL(), the table ranges were specified within a string constant.
* The only case where it would previously trigger the function to re-run was in the case of BIND variables.
  * If a bind variable used a cell reference in the parameter list, changes to that cell data would cause an update.
  * A typical use case scenario was date ranges.  When changing the start/end date in cell as it related to reports to run, the SQL SELECT would re-run.
* The gsSQL() inputs have been re-arranged, so now it is possible to have the custom function triggered when table data is updated.

---

# Syntax Update

```
gsSQL(statement, tableDefinitions, outputColumnTitles, bindVariables)
```

* statement - SQL SELECT statment.
  * e.g.:  **select * from sales** 
* tableDefinitions - TABLE NAME and SHEET RANGE
  * e.g.:  table name ==> **"sales"**
  * e.g.:  sheet range ==> **A216:C225**
* outputColumnTitles - Flag to indicate if field names included in output.
  * e.g.:  **true** - output field names in first row.
  * e.g.:  **false** - no field names output
* bindVariables - List of data parameters inserted into SELECT statement.
  * e.g.:  **B215, F215** - references to cell data to be inserted into SELECT.

---

# Syntax Example

![New Syntax](/img/postMar8_2023.png)

* In this example you can see that two tables are referenced:  **sales** and **recipe**
  * **sales** is specified by the range  A216:C225
  * **recipe** is specified by the range E216:H229
* No more tables are referenced, so that is the end of the table definitions.
  * The next parameter is the OUTPUT COLUMN setting.  The default value is TRUE (output columns), if this were omitted.
* After the output column flag is the bind variable list.  
  * The **?1** in the select is replaced by the data found in **B215** (start date)
  * The **?2** in the select is replaced by the data found in **F215** (end date)

# Triggering the Function to Run.
* The results of the SQL select should always be up to date now!  

## Trigger Events
* Reload the sheet OR
* Type something new in the gsSQL() parameter list OR
* Data in A216:C225 is modified OR
* Data in E216:H229 is modified OR
* Data in B215 is modified OR
* Data in F215 is modified.


