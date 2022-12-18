---
layout: post
title:  "Welcome to First Post!"
date:   2022-12-18 17:00:00 -0500
categories: jekyll update
---

# State of the Poster

* Currently working on implementing **CORRELATED SUB-QUERY** statements.
* The **CORRELATED SUB-QUERY** statement is when data from the current record in the outer query is available to the inner query.
  * What makes this statement different is that the outer query field is referenced, but there is no JOIN statement that would normally make this field available.
  * An example:  ```select title, (select count(*)  from Booksales where books.id = BookSales.book_id) as 'Quantity Sold' from books``` 
* The first step in working this out has been completed.  Initial support for returning a single value in the SELECT field field portion of the statement has been done.  
* Not much testing has been done on this part yet.
* I still need to handle this correlated sub-query in the **WHERE** portion of the statement - which is handled differently.

* Working to learn how to use Jekyll for publishing web site for all my custom functions.


