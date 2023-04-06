---
layout: default
title:  "Convert SQL Select to Query Syntax"
date:   2023-04-01 12:00:00 -0500
categories: QUERY
---

## Purpose

* Type in your SQL SELECT statement for conversion to Google Sheets QUERY.


    <form>
      <link rel="stylesheet" href="{{ '/css/demmings.css' | relative_url }}">

      <label for="sqlSelect">Enter SQL SELECT statement:</label>
      <br>
      <textarea id="sqlSelect" name="text" rows="5" cols="60" placeholder="SELECT A, B, C from books where B not in (select B from books where F like '3%')"></textarea>
      <br><br>
        <div class="grid-container">

                <div class="grid-item">
                    <input class="table_item" placeholder="books" id="table1" />
                    <input class="table_item" placeholder="Books!A1:F11" id="range1" />
                </div>
                
                <div class="grid-item">
                    <input class="table_item" placeholder="table name 2" id="table2" />
                    <input class="table_item" placeholder="range name 2" id="range2" />
                </div>  
                <div class="grid-item">
                    <input class="table_item" placeholder="table name 3" id="table3" />
                    <input class="table_item" placeholder="range name 3" id="range3" />
                </div>
                <div class="grid-item">
                    <input class="table_item" placeholder="table name 4" id="table4" />
                    <input class="table_item" placeholder="range name 4" id="range4" />
                </div>
        </div>

      <br>
      <button type='button' onclick="select2Query()">Submit</button>
      <br><br>
      <label for="output">QUERY syntax: </label><textarea id="output" name="text" rows="5" cols="60"></textarea>
    </form>

    <script src="{{ '/assets/js/query.js' | relative_url }}"></script>
    <script src="{{ '/assets/js/Select2Query.js' | relative_url }}"></script>