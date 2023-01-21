---
layout: default
title:  "Bind Variables in gsSQL"
date:   2023-01-21 17:00:00 -0500
categories: [New Feature]

keywords:
  - SQL
  - Where
  - Bind
---

# What are BIND variables.

* For any variable data used from the Google Sheet, it can be easily inserted into the SELECT statement.
* You can use cell data directly within the SELECT string, but this data needs to be concatenated into the string properly - which takes extra work.
  * This is especially true when trying to include DATE data in your select.
* For any variable data needed more than once in the SELECT, it cuts down on duplication.

# Why use BIND variables

* When used within an SQL server, it is used for
  * SQL Injection attacks.
  * Performance.  The execution plan only needs to be created once.

* gsSQL uses its own version of bind variables for
  * Less coding
  * Readability of SQL.

# How to use BIND variables

* The basic syntax for using gsSQL is as follows:
```
gsSQL(statement, tableArr, columnTitle, …bindings)
```
* **statement** - your SQL select string WITH bind data placeholders.
* **tableArr** - the definition of all referenced table names, plus where it is located.
* **columnTitle** - boolean indicating if column headers are included in return data.
* **...bindings** - a list of all bind data needed in SELECT.  There is no limit on the number of listed parameters here.

## Simple Example.
* Here is the basic syntax for using:
```
=gsSQL("select * from table where fld = ?1", {{"table", "table", 0}}, true, "idData")
```

* The ?1 will be substituted at run time.  The actual select would be run like this:
```
select * from table where fld = 'idData'
```

* The number after the question mark indicates which bind data item should be used based on its position in the list.
```
=gsSQL("select * from table where fld = ?1 and quantity < ?2 and price > ?3", {{"table", "table", 0}}, true, "idData", 10, 3.99)
```
* This would be translated to
```
select * from table where fld = 'idData' and quantity < 10 and price > 3.99
```

* The bind placeholders do not need to be used in the order they are listed and any variable can be reference more than once:
```
=gsSQL("select * from table where backOrder < ?2 and order > ?2 and fld = ?1", {{"table", "table", 0}}, true, "idData", 10)
```

* Using **Named Range** or **Cell** address.
* In this example the **startDate** and **endDate** are named ranges that contain date date.
```
=gsSQL("select * from table where date >= ?1 and date <= ?2", {{"table", "table", 0}}, true, startDate, endDate)
```

* You can also use A1 cell notation:
```
=gsSQL("select * from table where date >= ?1 and date <= ?2", {{"table", "table", 0}}, true, A1, A2)
```

## Syntax Shortcut
* You can use a TAB name as a table.  It is not necessary to define the table portion of the gsSQL() statement.  Just leave the table defintion as an empty parameter:
* This example MUST have a TAB named **booksales** with a column title **date** and named ranges called **startDate** and **endDate** (which can be anywhere in your spreadsheet).

```
=gsSQL("select * from booksales where date >= ?1 and date <= ?2", , true, startDate, endDate)
```