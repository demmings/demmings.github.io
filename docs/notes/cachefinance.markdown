---
layout: default
title:  "cachefinance Custom Function"
date:   2022-12-19 12:00:00 -0500
categories: cachefinance custom function replacement for CACHEFINANCE
---

# cachefinance

## About

* A Google Sheets custom function used to improve the reliability of GOOGLEFINANCE.


## Purpose

* Used with GOOGLEFINANCE() and sheets cache, so that valid results are always available - even when GOOGLEFINANCE is down.
* It also does a 3rd party website search for ticker symbols not supported by GoogleFinance.

## How does it help?
* GOOGLEFINANCE fails on a regular basis.  What does CACHEFINANCE() do to help?
  1. When GOOGLEFINANCE() works, the current value is saved to a cache and the function just returns this value.
     1. When it is working, GOOGLEFINANCE is much faster than checking external websites for data.
  2. When GOOGLEFINANCE() fails, the last cached value is returned instead of the error.
  3. Where there is an error and no cached value is available, 3rd party finance websites are queried in an attempt to extract the data.
       * Successful 3rd party website data is then cached for next request in case the 3rd party website also fails. 
       * Only the attributes:  "price", "name", "yieldpct" are supported when searching external websites.

## The custom function.
* You need to copy the source from:  [CacheFinance.js](https://github.com/demmings/cachefinance/blob/main/dist/CacheFinance.js)
* In your sheet, go to **Extensions** ==> **Apps Script** ==> **Files** ==> **+** ==> **Script**
* In the **Untitled**, just name the file anything you want, no extension is needed.
* Replace the:
```
function myFunction() { 
}
```
* with the data copied from **CacheFinance.js**
* Click on the **diskette** icon to save.
* Sheets may prompt you about allowing this script to run if this is the first Apps Script you have used in the project.
* You now have a new function available in your sheet.
  * In any cell, just start typing **=CACHEFINANCE** and you should see the help for this function.


## Using 
* **SYNTAX**.
    *  ```CACHEFINANCE(symbol, attribute, defaultValue)```
    * **symbol** - stock symbol using regular GOOGLEFINANCE conventions.
      * For best results, include the exchange code in the symbol (like'NASDAQ', 'NYSEARCA', ...).  
        * If you just specify the base stock symbol (like 'BNS') and the stock is interlisted, the website lookup may not retrieve the results you are expecting, i.e. BNS on TSE will be different than BNS on NASDAQ.
      * e.g.:  "NASDAQ:IGOV", "NYSEARCA:EWA", "TSE:BNS"
    * **attribute** - 
        * All GOOGLEFINANCE attributes:  [GoogleFinance Docs](https://support.google.com/docs/answer/3093281?hl=en)
          * The valid return of any of these data points will be cached in case of future errors.
        * Three supported attributes doing 3'rd party website lookups.
          * For the case where GOOGLEFIANCE just never supports a stock symbol.  
             * "price" 
             * "yieldpct"
             * "name"
      * You can specify other attributes that GOOGLEFINANCE uses, but the CacheFinance() function will not look up this data (using 3rd party finance website) if GOOGLEFINANCE does not provide an initial default value.
      * The following "low52" does not lookup 3'rd party website data, it will just save any value returned by GOOGLEFINANCE to cache, for the case when GOOGLEFINANCE fails to work:
    ```
        =CACHEFINANCE("TSE:ZIC","low52", GOOGLEFINANCE("TSE:ZIC", "low52"))
    ```
    * **defaultValue** - Use GOOGLEFINANCE() to supply this value either directly or using a CELL that contains the GOOGLEFINANCE value.
      * 'yieldpct' does not work for STOCKS and ETF's in GOOGLEFINANCE, so don't supply the third parameter when using that attribute.
    * Example: (symbol that is not recognized by GOOGLEFINANCE)
  
    ```
      =CACHEFINANCE("TSE:ZTL", "price", GOOGLEFINANCE("TSE:ZTL", "price"))
    ```
    * **Backdoor Commands**
        * Special commands are performed by entering specific values into the default parameter.
          * Yes I know it is possible that it could match a legitimate company name someday, but for now I will take that risk.
          * These functions are necessary in the case where you have many cached items in the script properties.  When this occurs, you cannot manually edit these properties anymore and the UI informs you that they must be changed programatically - which these functions will do for you.
        * Supported commands in third parameter:
          * **?**
          * **CLEARCACHE**
          * **GET**
          * **GETBLOCKED**
          * **HELP**
          * **LIST**
          * **REMOVED**
          * **SET**
          * **SETBLOCKED**
          * **TEST**
 
       * **?** or **HELP**.  Displays all supported special case commands.
         *  ```=CACHEFINANCE("", "", "?")```
      * **CLEARCACHE** - Removes CACHEFINANCE entries in script settings.  
         * You will see **Cache Cleared** when the entry has been removed from your script settings.  
         * ```=CACHEFINANCE("", "", "CLEARCACHE")```
           * Removes **ALL** CACHEFINANCE entries in script settings.  This will force a re-test of all finance websites the next time CACHEFINANCE cannot get valid data from GOOGLEFINANCE.  It will also remove entries for BLOCKED sites.
             * **NOTE:** You may get a timeout if there is a large number of entries in your script properties.
             * You can run it again by making Google think your parameters have changed.  Just change "clearcache" to "CLEARCACHE" and hit enter.  It will run again.
         * If you specify a symbol/attribute and clearcache, the long and short term cache for this data only is removed.
            * ```=CACHEFINANCE("TSE:CJP", "PRICE", "CLEARCACHE")```
            * This syntax does **NOT** remove preferred site or blocked site settings for this symbol/attribute.
      * **GET**, **GETBLOCKED** Shows the preferred site (GET) and the block site (GETBLOCKED) for the symbol/attribute combo.
        *  ```=CACHEFINANCE("TSE:CJP", "PRICE", "GET")```
      * **SET**, **SETBLOCKED**   Sets the preferred site (SET) and blocked site (SETBLOCKED)
        * ```=CACHEFINANCE("TSE:CJP", "PRICE", "SET", "YAHOO")```
        * **NOTE**  The preferred site may be changed by the custom function **IF** that site fails on a future lookup.  The **BLOCKED** site however is never changed automatically.
      *  **TEST**   Lists in a table results of a sanity test to third party finance sites.
            * ```=CACHEFINANCE("", "", "TEST")```
            * You will need around 20 free rows below for this command to run, as it will generate results for tests to each of the supported web sites.
      * **LIST**   Displays the ID for each web site lookup supported.
         * ```=CACHEFINANCE("", "", "LIST")```
         * You will need several free rows below ans this command will display each supported WEB ID.
         * Current supported web id's.
           * FINNHUB
             * Site is not used unless you set script property **FINNHUB_API_KEY** to key you generate from https://finnhub.io/register
           * TDETF
           * TDSTOCK
           * GLOBE
           * YAHOO
           * ALPHAVANTAGE
             * Site is not used unless you set script property **ALPHA_VANTAGE_API_KEY** to key you generate from https://www.alphavantage.co/
           * GOOGLEWEBSITEFINANCE
      * **REMOVE**  Takes the preferred site and moves it to the blocked site.
        * ```=CACHEFINANCE("TSE:CJP", "PRICE", "REMOVE")```


## Disadvantages of using IMPORTXML.
  * You could always just import from a site within your sheet but,
    * GoogleFinance is FASTEST.
      * Using just IMPORTXML means that it always searches external site for data, which is fine for a couple of stocks, but very slow for many lookups.
    * If the external site is down/not available, you will still get an error - nothing is cached.
    * CACHEFINANCE is the best of both worlds.  
      * Uses GOOGLEFINANCE data when working...
      * Uses a cached value when not working...
      * Uses external web site when nothing valid is available.
```
=iferror(IMPORTXML("https://ceo.ca/thnc", "//span[contains(concat(' ',normalize-space(@class),' '),' last-value ')]"))
```

## Advanages of having an API
  * Most of my third party website lookups are screen scraping the data - which is kinda slow.
  * Using an API is much faster, so I have added FINNHUB as a data source.
  * **Finnhub** 
    * For faster U.S. stock price lookups when external finance data is used, add the key to **Apps Script** ==> **Project Settings** ==> **Script Properties**
      * Click on **Edit Script Properties** ==> **Add Script Property**.  
        * Set the property name to:  **FINNHUB_API_KEY**
        * Set the value to:  *'YOUR FINNHUB API KEY'*
          * Get your API key at:  https://finnhub.io/   

## Github Project

[GitHub cachefinance](https://github.com/demmings/cachefinance)

