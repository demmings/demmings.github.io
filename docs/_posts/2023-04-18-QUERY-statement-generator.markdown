---
layout: default
title:  "Generate Google Sheets QUERY from Standard SQL"
date:   2023-04-18 08:00:00 -0500
categories: [Select2Query]

keywords:
  - SQL
  - JOIN
  - CALCULATED
  - QUERY
---

# QUERY Statement Generator
* Early prototype version finding its feet!!
* Converter Website: [Select2Query](https://demmings.github.io/notes/select2query.html)

## Purpose

* Generates Google Sheets QUERY function code.
* The SQL SELECT table **JOIN** when done in QUERY is fairly complicated.
* The **Select2Query** tool is used to convert a simple SELECT JOIN statement into functional QUERY syntax.
* The simple **WHERE IN (subquery)** is also supported.

### Join Example
* In this example, we want to show book info as it relates to the individual book sales.
* In SQL (using column names from Google Sheets), the syntax would be like this:
```sql
SELECT BookSales.A, BookSales.C, BookSales.D, Books.B, Books.C 
from BookSales 
inner join Books on BookSales.B = Books.A
```

* The Google Sheet QUERY would be something like this:
```
={ArrayFormula(Split(Query(Flatten(IF(BookSales!B2:B=Split(Textjoin("!",1,Books!A2:A),"!"),
    IF(BookSales!A2:A <> "",BookSales!A2:A, " ")&"!"& 
    IF(BookSales!C2:C <> "",BookSales!C2:C, " ")&"!"& 
    IF(BookSales!D2:D <> "",BookSales!D2:D, " ") &"!"&
    Split(Textjoin("!",1,Books!B2:B),"!")&"!"& 
    Split(Textjoin("!",1,Books!C2:C),"!"),)),"Where Col1!=''"),"!"))
}
```

### Where IN Example
* Only show books that were sold.
```sql
select A, B, C, D, E, F from Books where A in (select B from BookSales)
```
* Generated output from **Select2Query**
```
=QUERY(Books!A2:F, "SELECT A, B, C, D, E, F WHERE A MATCHES '"&TEXTJOIN("|", true, QUERY(BookSales!A2:F, "SELECT B"))&"'")
```

## Using the Converter

* Converter Website: [Select2Query](https://demmings.github.io/notes/select2query.html)

### Enter SQL SELECT statement
* Enter JOIN select statement using standard SQL syntax.
* Enter column names as upper case letters representing the column name in your Google Sheet.
* Each column referenced REQUIRES the table prefix syntax (**tablename.column**).

### Table Definitions
* Define each table referenced in SELECT statement.
* Define the sheet range of the table.
* Use A1 notation for the range.
* Use **TAB!** prefix for range if QUERY will be on a different sheet tab.

### Submit
* Click **Submit** when all required fields are entered.

### QUERY Syntax
* The generated function is generated in this text box.
* Copy all text from this text box.
* Insert the generated output into required location on your Google Sheet.

### Actual Screen Capture
![Query Example](/img/Select2Query.png)