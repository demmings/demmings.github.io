---
layout: default
title:  "Correlated Sub Query"
date:   2022-12-23 17:00:00 -0500
categories: feature
---

# New Feature

* **BASIC** Support for correlated sub-query for both a SELECT field and WHERE field has been added.
* This type of SELECT requires that a lookup is performed for every row from the master table in order to resolve the inner query.

```
    SELECT 
        id, title, 
        (
            select count(*) from booksales where books.id = booksales.book_id
        ) as 'Sold' 
    FROM books 
    WHERE 
    (
        select count(*) from booksales where books.id = booksales.book_id
    ) > 1
```