---
layout: default
title:  "Select where EXISTS using correlated Sub Query"
date:   2022-12-28 17:00:00 -0500
categories: [New Feature]

keywords:
  - SQL
  - Select
  - Where
  - Exists
---

# Syntax

```sql
    SELECT table1.a, table1.b FROM table1 WHERE EXISTS 
        (select * from table2 where table1.a = table2.a)
```

* The sub-query **(select * from table2 where table1.a = table2.a)** is solved for each row in table1.
* When the query is processed and is stepping through each record in the outer query (table1), the data for **table1.a** is used in the inner sub-query.
* This means that if there are 1,000 rows in the outer query, the inner sub-query will be executed 1,000 times. 
* Care should be taken to only use correlated sub-query when the tables are small.
* If the sub-query returns 1 or more records, the EXISTS sub-query is true and the record is placed in the return set.
* If the statement **NOT EXISTS** was used instead, the data from the outer query row would only be included in the return set if the sub-query returned no records.
* Using the [Test gsSQL](https://docs.google.com/spreadsheets/d/1Zmyk7a7u0xvICrxen-c0CdpssrLTkHwYx6XL00Tb1ws/edit?usp=sharing) Google Sheet, you can use the existing data (you don't need to enter data for the tables) and try out:
* Find open space on the first page and type into the cell:  
```
   =gsSQL("select * from customers where exists (SELECT * FROM booksales WHERE booksales.customer_id = customers.id) and email like '%gmail.com'")
```
* You should see results like this (**What it means:** Show me customers that had a sale and thier email ends with "gmail.com").

<style scoped>
table {
  font-size: 9px;
}
</style>

|CUSTOMERS.ID|	CUSTOMERS.NAME|	CUSTOMERS.ADDRESS|	CUSTOMERS.CITY|	CUSTOMERS.PHONE|	CUSTOMERS.EMAIL|
| ---       | ---             | ---              | ---            |  ---           | ---               |
|C1|	Numereo Uno|	101 One Way|	One Point City|	9051112111|	bigOne@gmail.com|
|C2|	Dewy Tuesdays|	202 Second St.|	Second City|	4162022222|	twoguys@gmail.com|

* Try the **NOT EXISTS** sql like this:
```sql
    select * from customers where not exists 
        (SELECT * FROM booksales WHERE booksales.customer_id = customers.id)
```

## Add to your sheet.
* Copy the contents of [gsSQL Custom Function](https://github.com/demmings/gsSQL/blob/main/dist/gssql.js) to your copy buffer.
* On your test sheet, create a new **Apps Script** (under Extensions) and paste in the contents to a new file.
* Once you save, the custom function **gsSQL()** will be available from any cell on your sheet.
  * Just start typing **=gsSQL("")** (and insert your own SELECT statement).

## Feedback is Appreciated.
* Drop me a comment at [Discussions](https://github.com/demmings/gsSQL/discussions)
