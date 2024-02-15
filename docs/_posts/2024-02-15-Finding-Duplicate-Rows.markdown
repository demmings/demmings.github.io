---
layout: default
title:  "How to Find Duplicates in Google Sheets [using gsSQL custom function]"
date:   2024-02-15 08:00:00 -0500
categories: [gsSQL]

keywords:
  - SQL
  - QUERY
  - SELECT
  - gsSQL
  - DUPLICATES
---

# Finding Duplicates Across Sheet(s)

## Finding Duplicates Across Two Similar Sheets

* When you have two different sheets that have the same structure, finding duplicates is quite easy.
* The SQL **INTERSECT** finds all records that have the same values.
* In this example, we have a sheet called **authors**  and a sheet called **editors**.
  * These two sheets have the exact same column format.

```
=gsSQL("select * from authors intersect select * from editors")
```

* see [Example Data](https://github.com/demmings/gsSQL/blob/main/readmeExampleData.md)

## Finding Duplicates Across Three (or more) Similar Sheets

* This situation requires a little more work since the **INTERSECT** will not find what is required.
* Now we need to create a sub-query that uses **UNION ALL** and then we can count the duplicates.
* In this example, we are create a sub-query (between the brackets) that will accumulate all of the data from the sheets named **editors**, **authors** and **translators**
* We then need to select and group the fields that would identify a row uniquely.  In this case in order to be unique, we need data from the columns **id**, **first_name** and **last_name**
* The grouped rows are then counted and we can display any row **HAVING** more than one.

```sql
=gsSQL("select id,  first_name, last_name, count(*) from 
    (select id, first_name, last_name from editors union all 
     select id, first_name, last_name from Authors union all 
     select id, first_name, last_name from translators) as test 
     group by id, first_name, last_name having count(*) > 1")
```

##  Finding Duplicates on One Sheet.

* The approach is similar to the case of three or more sheets to be compared (see above).
* The approach here is to just select and group the fields that are used to uniquely identify the row.
* In the following example, we are saying that **id**, **first_name** and **last_name** on the **authors** sheet will indicate what should be considered a unique row.

```
=gsSQL("select id,  first_name, last_name, count(*) from authors group by id, first_name, last_name having count(*) > 1")
```

## Installing gsSQL Custom Function.

* Copy the source for [gsSQL.gs](https://github.com/demmings/gsSQL/blob/main/dist/gssql.js) into a new file under **Extensions**, **Apps Script**
* After the file is saved and Google Sheets permissions are given, you now have access to a custom function in any cell just by typing **=gsSQL("select * from Sheet1")**
* Further [instructions](https://github.com/demmings/gsSQL)
* The above examples assume that the **TABLE** name is the **SHEET** name.  When this is not the case, you will need to add some extra parameters to the **=gsSQL()** command.
* For example:
```
=gsSQL("select id,  first_name, last_name, count(*) from authors group by id, first_name, last_name having count(*) > 1", "authors", Authors!A1:C)
```
* The advantage of specifying each table in the command is that the **gsSQL** custom function will automatically run whenever data changes in the specified range **Authors!A1:C**
* All tables referenced must then be listed on the command line.
  * Just keep adding **"logicalTableName""**, **GoogleRange** until all tables are defined.
* If the table is not explicitly defined on the command line, the **gsSQL** custom function will normally only run when the spreadsheet is loaded.