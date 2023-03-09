---
layout: default
title:  "GROUP BY in gsSQL"
date:   2023-02-27 08:00:00 -0500
categories: [New Feature, gsSQL]

keywords:
  - SQL
  - GROUP BY
---

# GROUP BY syntax
```
SELECT column_name(s)
    FROM table_name
    WHERE condition
    GROUP BY column_name(s)
    ORDER BY column_name(s);
```
* Typically you would select a COLUMN name to group by.
* It is also permissible to use an expression that would be resolved and grouped on.

# What is GROUP BY used for?

* It is used to SUMMARIZE data for records in specific groups.
* For example, if you wanted to find trends in customer sales data, you might want to know the total sales for each month.
* In the following example, we can find sales figures by month number in the year 2022.
```sql
select sum(quantity*price), month(date) from booksales where year(date) = 2022 group by month(date);
```

# What selected fields are allowed in a select with GROUP BY?
* The GROUP BY statement is used with aggregate functions COUNT(), MAX(), MIN(), SUM(), AVG().
* You can also specify the GROUP BY key value as well.  So for example above, you would be permitted to also select **month(date)** (which is the group by key)
* You cannot specify other columns that are not grouped.  
  * If you think about it, this makes sense for the output of the summary record.  If you also included the **CUSTOMER_ID**, there could possibly be many different customer sales in the month, so it would not be possible to have those customers listed when displaying the MONTH total. 

# gsSQL and GROUP BY.
* In the old version of gsSQL(), you could only group on a column.  In the previous example we were able to group on the **date**, but it was not possible to group on the month by using the expression **month(date)**.
* You can also use more complicated GROUP BY.  Say for example you wanted to know daily sales per telephone area code.  This is now possible using gsSQL() custom function in your Google Sheets.
```sql
select concat(convert(substr(customers.phone,1,3),char), booksales.date), count(*) 
   from booksales 
   join customers on booksales.customer_id = customers.id 
   group by concat(convert(substr(customers.phone,1,3),char), booksales.date)
```
