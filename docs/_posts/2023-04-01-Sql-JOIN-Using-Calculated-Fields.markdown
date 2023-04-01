---
layout: default
title:  "Using a calculation to evaluate JOIN condition."
date:   2023-04-01 08:00:00 -0500
categories: [gsSQL]

keywords:
  - SQL
  - JOIN
  - CALCULATED
---

# SQL JOIN

* A JOIN clause is used to combine rows from two or more tables, based on a related column between them.
* In most cases, this is simply done by equating the two key linking fields in the join statement.
* In the following example, we have a books table and authors table.  The **books.author_id** links to the author in the authors table field **authors.id**
* The resulting derived virtual table will contain all columns from both source tables like it was a single table.
* Normally you would not want have a single table with all the data because of all the duplicated data.
  * I guess if all authors only ever wrote one book, we could have just one table and have no duplication.  But is this realistic?

```sql
SELECT 
    books.id, books.title, authors.first_name, authors.last_name 
    FROM books 
    INNER JOIN authors 
    ON books.author_id = authors.id 
    ORDER BY books.id
```

* In a perfect world, all tables would perfectly normalized (no duplication) and all columns would have atomic values.
  * **Atomic** means "cannot be divided or split in smaller parts".
* In the case where the column data in one table needs to be manipulated in order to match the key value in the other table to be joined, it will require the use an SQL expression.
* For an example, what if our **BookSales** table never had the customer ID as a unique table column, but the information could be extracted from the invoice number.  In this case, you can't just directly join the INVOICE to the CUSTOMER.  We need to do a little manipulation using an SQL function.

```sql
        select invoice, name 
        from booksales 
        inner join customers on substr(booksales.invoice, 2, 5) = customers.id

```

* Support for basic SQL expressions are now supported in the latest versions of gsSQL() custom functom.