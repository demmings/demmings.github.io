---
layout: default
title:  "Finding a good estimation of future RRSP withdrawals"
date:   2024-12-10 08:00:00 -0500
categories: [CanadianTaxes]

keywords:
  - TAXES
  - CANADIAN
  - SHEETS
---

# Calculate a future GROSS income (in Canada)

## Purpose

* Use a Google Sheets custom function in order to estimate future taxes for any DIY financial planners. 
* The more accurately you can estimate future taxes on your RRSP withdrawals, the more accurately you will be able to estimate how much to take out of your RRSP this coming year (and beyond).
  * So you can die with ZERO.  I would prefer enough to cover funeral expenses though.

## RRSP meltdown strategy

* If you have a robust defined benefit pension plan (you know who you are government/hydro workers), please don't read any future and just keep collecting your overly generous pension cheques.
* For the rest of us where most of our pension incomes will be derived from our RRSP savings, we need to have some kind of withdrawal strategy.
* Typical strategies are:
  * 4% rule - https://www.britannica.com/money/4-percent-rule-retirement
  * Percentage of portfolio - withdraw exact same percent of existing portfolio every year (you can never run out of money).
  * Buckets of money (money allocated for next 'x' years)
  * Safety first - Wade Pfau - https://retirementresearcher.com/what-is-a-safety-first-retirement-plan/#:~:text=The%20goal%20is%20to%20have,cash%20flow%20characteristics%20are%20comparable.
  * Dynamic spending - you adjust spending depending on how markets have performed
* My approach is SOME SAFETY plus DYNAMIC spending.
  * The safety porition is annuities I have purchase for me and my wife PLUS CPP and OAS.
    * This alone would be enough for a basic dreary life - but we could survive.
  * Every year a calculation is done to estimate how much to withdraw from RRSP's and die with zero.
  * In order to not have garbage in / garbage out calculations (GIGO) - we need to have a fairly accurate estimation of one of the biggest expenses in retirement - TAXES.

## My RRSP estimation strategy
* Find an initial net income and in the years that follow,  use whatever increase/decrease algorithm you feel appropriate about.
* For example, as you get into the SLOW-GO and NO-GO years, your spending will drop.
  * https://www.kitces.com/blog/age-banding-by-basu-to-model-retirement-spending-needs-by-category/
* From that net income entry, subtract any no/low tax income (i.e. from TFSA or any after tax money).
* The amount that is left must be funded from taxable money - so find the GROSS income needed from this - using the CanadianTaxes custom function I have written.
* From this amount - subtract all non-RRSP income sources like CPP, OAS, company pensions, taxable annuity...
* The remainder is how much you need to withdraw from your RRSP.
* Now take this amount and subtract from your total RRSP assets and then add your expected return to come up with your ending RRSP value for the year.
* Going forward from this year, if the year after death you still have RRSP assets, you can increase your initial net income for spending - and obviously if the reverse is true, you would need to decrease your initial net income.
* Keep iterating until you are very close to zero in the year following your (projected) passing.