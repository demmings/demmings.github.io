---
layout: default
title:  "cachefinance Custom Function"
date:   2022-12-19 12:00:00 -0500
categories: cachefinance custom function replacement for CACHEFINANCE
---

# cachefinance

## About

* A new custom function written in Javascript for use in Google Sheets.
* Used in conjunction with GOOGLEFINANCE() and sheets cache, so that valid results are always available.

## Purpose

* A custom function that provides enhanced functionality over GOOGLEFINANCE() function.
* Using this function as an event Trigger, along with GOOGLEFINANCE() provides improved reliability.

## Using as a custom function.
* The custom function **CACHEFINANCE** enhances the capabilities of GOOGLEFINANCE.
* When it is working, GOOGLEFINANCE() is much faster to retrieve stock data than calling a URL and scraping the finance data - so it is used as the default source of information.
* When GOOGLEFINANCE() works, the data is cached.
* When GOOGLEFINANCE() fails ('#N/A'), CACHEFINANCE() will search for a cached version of the data.  It is better to return a reasonable value, rather than just fail.  If your asset tracking scripts have just one bad data point, your total values will be invalid.
* If the data cannot be found in cache, the function will attempt to find the data at various financial websites.  This process however can take several seconds just to retrieve one data point.
* If this also fails, PRICE and YIELDPCT return 0, while NAME returns an empty string.
* **CAVEAT EMPTOR**.  Custom functions are also far from perfect.  If Google Sheets decides to throw up the dreaded 'Loading' error, you are almost back to where we started with an unreliable GOOGLEFINANCE() function.
     * However, in my testing it seems to happen more often when you are doing a large number of finance lookups. 
* **SYNTAX**.
    *  ```CACHEFINANCE(symbol, attribute, defaultValue)```
    * **symbol** - stock symbol using regular GOOGLEFINANCE conventions.
    * **attribute** - three supported attributes doing 3'rd party website lookups:  
       * "price" 
       * "yieldpct"
       * "name"
       * "test" -  special case.  Lists in a table results of tests to third party finance sites.
         * ```CACHEFINANCE("", "TEST")```
      * You can specify other attributes that GOOGLEFINANCE uses, but the CacheFinance() function will not look up this data (using 3rd party finance website) if GOOGLEFINANCE does not provide an initial default value.
      * The following "low52" does not lookup 3'rd party website data, it will just save any value returned by GOOGLEFINANCE to cache, for the case when GOOGLEFINANCE fails to work:
    ```
        =CACHEFINANCE("TSE:ZIC","low52", GOOGLEFINANCE("TSE:ZIC", "low52"))
    ```
    * **defaultValue** - Use GOOGLEFINANCE() to supply this value either directly or using a CELL that contains the GOOGLEFINANCE value.
      * 'yieldpct' does not work for STOCKS and ETF's in GOOGLEFINANCE, so don't supply the third parameter when using that attribute.
    * Example: (symbol that is not recognized by GOOGLEFINANCE)
        *  ```=CACHEFINANCE("TSE:ZTL", "price", GOOGLEFINANCE("TSE:ZTL", "price"))```


## Github Project

[GitHub cachefinance](https://github.com/demmings/cachefinance)

