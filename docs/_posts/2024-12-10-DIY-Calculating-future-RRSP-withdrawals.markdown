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

## CanadianTaxes Google Sheets Custom Function
* Project link [Github Project](https://github.com/demmings/CanadianTaxes)
* Source code link [CanadianTaxes Custom Function Source](https://github.com/demmings/CanadianTaxes/blob/main/dist/CanadianTaxes.js)

## RRSP meltdown strategy

* If you have a robust defined benefit pension plan (you know who you are government/hydro workers), please don't read any future and just keep collecting your overly generous pension cheques.
* For the rest of us where most of our pension incomes will be derived from our RRSP savings, we need to have some kind of withdrawal strategy.
* Typical strategies are:
  * [4% rule](https://www.britannica.com/money/4-percent-rule-retirement)
  * Percentage of portfolio - withdraw exact same percent of existing portfolio every year (you can never run out of money).
  * Buckets of money (money allocated for next 'x' years)
  * Safety first - [Wade Pfau](https://retirementresearcher.com/what-is-a-safety-first-retirement-plan/#:~:text=The%20goal%20is%20to%20have,cash%20flow%20characteristics%20are%20comparable).
  * Dynamic spending - you adjust spending depending on how markets have performed
* My approach is SOME SAFETY plus DYNAMIC spending.
  * The safety porition is annuities I have purchase for me and my wife PLUS CPP and OAS.
    * This alone would be enough for a basic dreary life - but we could survive.
  * Every year a calculation is done to estimate how much to withdraw from RRSP's and die with zero.
  * In order to not have garbage in / garbage out calculations (GIGO) - we need to have a fairly accurate estimation of one of the biggest expenses in retirement - TAXES.

## My RRSP estimation strategy
* Find an initial net income and in the years that follow,  use whatever increase/decrease algorithm you feel appropriate about.
* For example, as you get into the SLOW-GO and NO-GO years, your spending will drop.
  * [kitches.com](https://www.kitces.com/blog/age-banding-by-basu-to-model-retirement-spending-needs-by-category/)
* From that net income entry, subtract any no/low tax income (i.e. from TFSA or any after tax money).
* The amount that is left must be funded from taxable money - so find the GROSS income needed from this - using the CanadianTaxes custom function I have written.
* From this amount - subtract all non-RRSP income sources like CPP, OAS, company pensions, taxable annuity...
* The remainder is how much you need to withdraw from your RRSP.
* Now take this amount and subtract from your total RRSP assets and then add your expected return to come up with your ending RRSP value for the year.
* Going forward from this year, if the year after death you still have RRSP assets, you can increase your initial net income for spending - and obviously if the reverse is true, you would need to decrease your initial net income.
* Keep iterating until you are very close to zero in the year following your (projected) passing.

## Solving initial net income.
* Add a button on your sheet and assign script to run.  (e.g. getIncomeForMe)
* Set a NAMED RANGE for your initial net income cell (e.g. currentNetIncome)
* Set a NAMED RANGE for final year of RRSP value - year after passing (e.g. finalYearRspValue)
* Add this function into an Apps script

```
function getIncomeForMe() {
    balanceToZero("currentNetIncome", "finalYearRspValue", 500, 50);
}
```

* Add this script to solve problem.  If all is good, it should not take more than 1 minute to run.

```
/**
 * 
 * @param {String} netIncomeCell - Named range of CELL that contains net income
 * @param {String} accountBalanceCell - Named range of CELL that has account balance in year after passing
 * @param {Number} startingDelta - Starting amount to adjust net income if there is a balance
 * @param {Number} maxDiff - Solve until the ending balance is plus/minus this value.
 * @returns {Number}
 */
function balanceToZero(netIncomeCell, accountBalanceCell, startingDelta, maxDiff) {
    const ss = SpreadsheetApp.getActive();
    const sheet = ss.getActiveSheet();
    const accountBalanceRange = sheet.getRange(accountBalanceCell);
    const netIncomeRange = sheet.getRange(netIncomeCell);

    const startSalary = netIncomeRange.getValue();
    const endingBalance = accountBalanceRange.getValue();
    let currentBalance = endingBalance;
    let floorDiff = 0;    //  Last salary DELTA where end balance has not gone from 0 to non zero (viceversa)
    let ceilinigDiff = endingBalance === 0 ? -startingDelta : startingDelta;

    //  Get a ballpark range of change net income - refined in following step.
    while ((endingBalance === 0 && currentBalance === 0) || (endingBalance > 0 && currentBalance !== 0)) {
        netIncomeRange.setValue(startSalary + ceilinigDiff);
        currentBalance = accountBalanceRange.getValue();

        if ((endingBalance === 0 && currentBalance === 0) || (endingBalance > 0 && currentBalance !== 0)) {
            floorDiff = ceilinigDiff;
            ceilinigDiff *= 2;
        }
    }

    //  The ceilingDiff is too much of a change.  It should be between the floor and ceiling.
    let splitDiff = (ceilinigDiff + floorDiff) / 2;
    while (Math.abs(ceilinigDiff - floorDiff) > maxDiff) {
        netIncomeRange.setValue(startSalary + splitDiff);
        currentBalance = accountBalanceRange.getValue();

        if (endingBalance === 0) {
            //  This means the startSalary was too high - since nothing was left.
            if (currentBalance === 0) {
                //  The startSalary PLUS the split difference is still TOO HIGH.  We
                //  must reduce our salary again.
                floorDiff = splitDiff;
            }
            else {
                //  The was reduced too much now.  We have something left in the pot.
                ceilinigDiff = splitDiff;
            }
        }
        else {
            //  This means the startSalary was too low - since the end balance is > 0. 
            if (currentBalance > 0) {
                //  Salary is still TOO LOW.
                floorDiff = splitDiff;
            }
            else {
                ceilinigDiff = splitDiff;
            }
        }

        splitDiff = (ceilinigDiff + floorDiff) / 2;
    }

    return startSalary + splitDiff;
}
```