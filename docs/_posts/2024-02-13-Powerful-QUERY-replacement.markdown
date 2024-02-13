---
layout: default
title:  "Google Sheets Query function: The Most Powerful Function in Google Sheets"
date:   2024-02-12 08:00:00 -0500
categories: [gsSQL]

keywords:
  - SQL
  - QUERY
  - SELECT
  - gsSQL
---

# The most powerful built-in function in Google Sheets

* The Google Sheets Query function is the most powerful and versatile function in Google Sheets.

* It allows you to use data commands to manipulate your data in Google Sheets, and it’s incredibly versatile and powerful.

* God help you when you need to write something complicated.
  * You will need to scour the internet for information since nothing is intuitive when writing something useful and complex.
  * When (and if) you manage to write your beautiful QUERY after spending a few hours researching, you will do everything in your powers to never change it two years from now since you will never remember what in the heck is going on inside this mess.
  * Keep all sharp objects like a pencil away from your computer while you decode this gibberish, otherwise you will be tempted to poke yourself in your eye with the pencil.
  * Never insert or remove a column within your QUERY data range otherwise all of the super smart LETTER column references will need to be updated in your QUERY SELECT.
  * Flush most of your knowledge gained over your career writing simple and intuitive SQL SELECT statements down the drain. At first you think, hey this is pretty similar.  But then it hits you when you need something other than:
```
SELECT C, count(B), min(D), max(D), avg(D)
GROUP BY C
ORDER BY avg(D) DESC
LIMIT 3
``` 

* So you want to do something simple like filter your data between two dates:
```
=QUERY(Data!$A$1:$H$136,"select C, B where B > date '"&TEXT(A1,"yyyy-mm-dd")&"' and B <= date '"&TEXT(B1,"yyyy-mm-dd")&"'",1)
```

* Is your time not valuable to you?  Using gsSQL() it would be:

```
=gsSQL("select invoice, date from booksales where date >= ?1 and date <= ?2", "booksales", booksalesTABLE, true, startDate, endDate)

invoice	date
I7202	5/2/2022
I7203	5/2/2022
I7204	5/3/2022
I7204	5/3/2022
I7204	5/3/2022
I7205	5/4/2022
I7206	5/4/2022
```

* Using this gsSQL() syntax does include some extra overhead to define our table.
  *  "booksales" --> this is the table name assigned to the named range 'booksalesTABLE'
     *  The named range for 'booksales' has column titles in the first row like 'invoice' and 'date'.
  *  startDate - a named range containing a date.
  *  endDate - a named range containing a date.
* This is just a simple example where you need to remember how to format your date in the QUERY.

* Another simple example is the inner join.
  * 'books' is a sheet name
    * First row is:  **"id"	"title"	"type"	"author id"	"editor id"	"translator id"**
  * 'authors' is a sheet name
    * First row is:  **"id"	"first_name"	"last_name"**

```
=gsSQL(
    "SELECT books.id, books.title, authors.first_name, authors.last_name 
        FROM books 
        INNER JOIN authors 
        ON books.author_id = authors.id 
        ORDER BY books.id")

books.id	books.title	        authors.first_name	authors.last_name
1	        Time to Grow Up!	Ellen	            Writer
2	        Your Trip	        Yao	                Dou
3	        Lovely Love	        Donald	            Brain
4	        Dream Your Life	    Ellen	            Writer
5	        Oranges	            Olga	            Savelieva
6	        Your Happy Life	    Yao	                Dou
7	        Applied AI	        Jack	            Smart
8	        My Last Book	    Ellen	            Writer
```

* Here is the corresponding gibberish using built in Google Sheets functions (I didn't bother with adding column titles):

```
=QUERY( ArrayFormula(
     LET(
          lt, Books!A2:F10, lt_id, Books!D2:D10, rt, Authors!A2:C6, rt_id, Authors!A2:A6, 
          look_up, VLOOKUP(lt_id, HSTACK(rt_id, rt), SEQUENCE(1, COLUMNS(rt), 2), 0), 
          merge, HSTACK(lt, look_up), 
          FILTER(merge, CHOOSECOLS(look_up, 1)<>"")
     )
), "select Col1, Col2, Col8, Col9")

1	        Time to Grow Up!	Ellen	            Writer
2	        Your Trip	        Yao	                Dou
3	        Lovely Love	        Donald	            Brain
4	        Dream Your Life	    Ellen	            Writer
5	        Oranges	            Olga	            Savelieva
6	        Your Happy Life	    Yao	                Dou
7	        Applied AI	        Jack	            Smart
8	        My Last Book	    Ellen	            Writer
```

* Are you going to remember what is going on with this in six months?  
* How long does it take to write this stuff when you have to reference the internet or old code every time.
* Is it even obvious when it is doing when you look at it?
* This is an extremely simple join.  What happens when you want to join multiple tables, sort it, group it, or do moderately complex WHERE conditions.
* Save your brain and use your existing SQL SELECT knowledge.  Ok, so you will need to add one file to your app script folder.  You will also need to agree to the warnings that Google will try to scare you with, but you can handle it.  I know you can

[gsSQL.js](https://github.com/demmings/gsSQL/blob/main/dist/gssql.js)