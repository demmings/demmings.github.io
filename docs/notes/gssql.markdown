---
layout: default
title:  "gsSQL Custom Function"
date:   2022-12-19 12:00:00 -0500
categories: gssql custom function replacement to QUERY
---

## Purpose

* A custom function that:
  *  Uses standard SQL syntax.
  *  Simplifies your QUERY statements.
  *  Faster to write than QUERY.
  *  Easier to maintain than QUERY.
  *  More functionality than QUERY by having
     *  JOIN statements.
     *  Sub-Queries.
     *  Pivot statement.

## About

* A new custom function written in Javascript for use in Google Sheets.
* See it working with 100 test cases:  [Test gsSQL](https://docs.google.com/spreadsheets/d/1Zmyk7a7u0xvICrxen-c0CdpssrLTkHwYx6XL00Tb1ws/edit?usp=sharing)
* Open source and free to use.



## Github Project

[GitHub gsSQL](https://github.com/demmings/gsSQL)

# Usage

{% raw %}
```=gsSQL( SelectSqlStatement, [TableDefinitions], [ColumnOutputFlag], [BindVariableData])```

1.  **SelectSqlStatement.**  (Required)
    * Simple select example.  There is a sheet called 'authors' and data starts in row 1, column 1.
  ```
    =gsSQL("select * from authors")
  ```

    * Advanced select with no configuration example.  Requires sheets named 'books', 'authors' and 'translators'.
  ```sql
     =gsSQL
     (
        "SELECT 
            books.id, books.title, books.type, authors.last_name, translators.last_name 
        FROM books 
        LEFT JOIN authors ON books.author_id = authors.id 
        LEFT JOIN translators ON books.translator_id = translators.id 
        ORDER BY books.id"
    )
  ```

    * Only the **SELECT** statement is supported.
    * Most all common SELECT syntax is supported.  
    * The first row of the table MUST contain unique column titles (for field names).
      * To reference a field where the title contains spaces, just use the underscore in place of the space.
        * Column Title = "Transaction Date"
        * SELECT = ```"SELECT transaction_date from master_transactions"```
    
1. **TableDefinitions**  (Optional) 
   * Defines each table referenced in **SELECT** statement.
   * If a table does not encompass an entire sheet or you need to specify a range for the data, a table definition is required.
   * The table definition is an Array of arrays.  Each inner array defines ONE table.
     * a) Table name.  
       * This is the table name referenced in the select. This is a logical table name which will associated with the data range.  It does not have to be the sheet name (string).
     * b) Range of data. 
       * The google range that contains the data with the first row containing titles (used as field names).  This is any valid Google Sheet range name (i.e. Sheet Name, A1 notation or named range), but it must be passed in as a **STRING** (string)
     * c) Cache seconds.
       * (integer) number of seconds that data loaded from range is held in cache memory before another select of the same range would load again. (default=60)
     * d) Has Column Title.
       * (boolean) set to **false** if no column title in first row of data.  Columns are then referenced as column letter.  The first column of DATA is column **A**.  (default=true)
    * Use the CURLY bracket notations to create the double array of table definitions.  If two separate tables are used within your SELECT, the table specifications would be entered as follows.
        * **{{a, b, c}; {a, b, c}}**
    * For example, if there are no column titles on the sheet, we must use the table definitions.
  ```
     =gsSQL
     (
        "SELECT 
            booksales.A as 'Invoice', booksales.B as 'Book ID', CUST.A, CUST.B 
        FROM booksales 
        LEFT JOIN customers as CUST on booksales.C = customers.A ",
        {{"CUSTOMERS","CUSTOMERS!A2:F",60, false}; {"BOOKSALES","BOOKSALES!A2:F",60, false}}, true
    )
  ```
    
1.  **ColumnOutputFlag**  (Optional)
    * Include column title in output or not. (true adds column titles, false omits the title row).


3.  **BindVariableData**. (Optional) 
    * There should be one data item listed PER question mark in the SELECT statement.  Data for the variables can be literal data, cell references (A1 notation), and named fields.
    * Bind variables are for convenience only.
    * You can concatenate the various string components with the variable data to make a valid SELECT.  It is just less messy using bind data.
    * In the following example, **startDate** and **endDate** are named ranges on the sheet.
  ```
    =gsSQL
    (
        "select  
            booksales.invoice as 'Invoice', booksales.quantity as 'Quantity', booksales.price as 'Price', booksales.quantity * booksales.price as 'Sales', booksales.date, books.title, customers.name, authors.first_name + ' ' + authors.last_name as 'Author', translators.first_name + ' ' + translators.last_name as 'Translator', editors.first_name + ' ' + editors.last_name as 'Editor' 
        from booksales left join books on booksales.book_id = books.id 
        left join customers on booksales.customer_id = customers.id 
        left join authors on books.author_id = authors.id 
        left join translators on books.translator_id = translators.id 
        left join editors on books.editor_id = editors.id 
        where booksales.date >= ? and booksales.date <= ? 
        union all select 'Total', SUM(booksales.quantity), avg(booksales.price), SUM(booksales.quantity * booksales.price), '' ,'', '', '', '', '' from booksales 
        where booksales.date >= ? and booksales.date <= ?",
        , true, startDate, endDate, startDate, endDate
    )
  ```

{% endraw %}

