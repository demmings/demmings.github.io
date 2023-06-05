
//  Code inspired from:  https://github.com/dsferruzza/simpleSqlParser

/**
 * @classdesc 
 * Parse SQL SELECT statement and convert into Abstract Syntax Tree 
 */
class SqlParse {
    /**
     * @param {String} cond 
     * @returns {String}
     */
    static sqlCondition2JsCondition(cond) {
        const ast = SqlParse.sql2ast(`SELECT A FROM c WHERE ${cond}`);
        let sqlData = "";

        if (typeof ast.WHERE !== 'undefined') {
            const conditions = ast.WHERE;
            if (typeof conditions.logic === 'undefined') {
                sqlData = SqlParse.resolveSqlCondition("OR", [conditions]);
            }
            else {
                sqlData = SqlParse.resolveSqlCondition(conditions.logic, conditions.terms);
            }

        }

        return sqlData;
    }

    /**
     * Parse a query
     * @param {String} query 
     * @returns {Object}
     */
    static sql2ast(query) {
        // Define which words can act as separator
        const myKeyWords = SqlParse.generateUsedKeywordList(query);
        const [parts_name, parts_name_escaped] = SqlParse.generateSqlSeparatorWords(myKeyWords);

        //  Include brackets around separate selects used in things like UNION, INTERSECT...
        let modifiedQuery = SqlParse.sqlStatementSplitter(query);

        // Hide words defined as separator but written inside brackets in the query
        modifiedQuery = SqlParse.hideInnerSql(modifiedQuery, parts_name_escaped, SqlParse.protect);

        // Write the position(s) in query of these separators
        const parts_order = SqlParse.getPositionsOfSqlParts(modifiedQuery, parts_name);

        // Delete duplicates (caused, for example, by JOIN and INNER JOIN)
        SqlParse.removeDuplicateEntries(parts_order);

        // Generate protected word list to reverse the use of protect()
        let words = parts_name_escaped.slice(0);
        words = words.map(item => SqlParse.protect(item));

        // Split parts
        const parts = modifiedQuery.split(new RegExp(parts_name_escaped.join('|'), 'i'));

        // Unhide words precedently hidden with protect()
        for (let i = 0; i < parts.length; i++) {
            parts[i] = SqlParse.hideInnerSql(parts[i], words, SqlParse.unprotect);
        }

        // Analyze parts
        const result = SqlParse.analyzeParts(parts_order, parts);

        if (typeof result.FROM !== 'undefined' && typeof result.FROM.FROM !== 'undefined' && typeof result.FROM.FROM.as !== 'undefined') {
            if (result.FROM.FROM.as === '') {
                throw new Error("Every derived table must have its own alias");
            }

            //   Subquery FROM creates an ALIAS name, which is then used as FROM table name.
            result.FROM.table = result.FROM.FROM.as;
            result.FROM.isDerived = true;
        }

        return result;
    }

    /**
    * 
    * @param {String} logic 
    * @param {Object} terms 
    * @returns {String}
    */
    static resolveSqlCondition(logic, terms) {
        let jsCondition = "";

        for (const cond of terms) {
            if (typeof cond.logic === 'undefined') {
                if (jsCondition !== "" && logic === "AND") {
                    jsCondition += " && ";
                }
                else if (jsCondition !== "" && logic === "OR") {
                    jsCondition += " || ";
                }

                jsCondition += ` ${cond.left}`;
                if (cond.operator === "=") {
                    jsCondition += " == ";
                }
                else {
                    jsCondition += ` ${cond.operator}`;
                }
                jsCondition += ` ${cond.right}`;
            }
            else {
                jsCondition += SqlParse.resolveSqlCondition(cond.logic, cond.terms);
            }
        }

        return jsCondition;
    }

    /**
     * 
     * @param {String} query
     * @returns {String[]} 
     */
    static generateUsedKeywordList(query) {
        const generatedList = new Set();
        // Define which words can act as separator
        const keywords = ['SELECT', 'FROM', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN', 'ORDER BY', 'GROUP BY', 'HAVING', 'WHERE', 'LIMIT', 'UNION ALL', 'UNION', 'INTERSECT', 'EXCEPT', 'PIVOT'];

        const modifiedQuery = query.toUpperCase();

        for (const word of keywords) {
            let pos = 0;
            while (pos !== -1) {
                pos = modifiedQuery.indexOf(word, pos);

                if (pos !== -1) {
                    generatedList.add(query.substring(pos, pos + word.length));
                    pos++;
                }
            }
        }

        // @ts-ignore
        return [...generatedList];
    }

    /**
     * 
     * @param {String[]} keywords 
     * @returns {String[][]}
     */
    static generateSqlSeparatorWords(keywords) {
        let parts_name = keywords.map(item => `${item} `);
        parts_name = parts_name.concat(keywords.map(item => `${item}(`));
        const parts_name_escaped = parts_name.map(item => item.replace('(', '[\\(]'));

        return [parts_name, parts_name_escaped];
    }

    /**
     * 
     * @param {String} src 
     * @returns {String}
     */
    static sqlStatementSplitter(src) {
        let newStr = src;

        // Define which words can act as separator
        const reg = SqlParse.makeSqlPartsSplitterRegEx(["UNION ALL", "UNION", "INTERSECT", "EXCEPT"]);

        const matchedUnions = reg.exec(newStr);
        if (matchedUnions === null || matchedUnions.length === 0) {
            return newStr;
        }

        let prefix = "";
        const parts = [];
        let pos = newStr.search(matchedUnions[0]);
        if (pos > 0) {
            prefix = newStr.substring(0, pos);
            newStr = newStr.substring(pos + matchedUnions[0].length);
        }

        for (let i = 1; i < matchedUnions.length; i++) {
            const match = matchedUnions[i];
            pos = newStr.search(match);

            parts.push(newStr.substring(0, pos));
            newStr = newStr.substring(pos + match.length);
        }
        if (newStr.length > 0)
            parts.push(newStr);

        newStr = prefix;
        for (let i = 0; i < matchedUnions.length; i++) {
            newStr += `${matchedUnions[i]} (${parts[i]}) `;
        }

        return newStr;
    }

    /**
     * 
     * @param {String[]} keywords 
     * @returns {RegExp}
     */
    static makeSqlPartsSplitterRegEx(keywords) {
        // Define which words can act as separator
        let parts_name = keywords.map(item => `${item} `);
        parts_name = parts_name.concat(keywords.map(item => `${item}(`));
        parts_name = parts_name.concat(parts_name.map(item => item.toLowerCase()));
        const parts_name_escaped = parts_name.map(item => item.replace('(', '[\\(]'));

        return new RegExp(parts_name_escaped.join('|'), 'gi');
    }

    /**
     * 
     * @param {String} str 
     * @param {String[]} parts_name_escaped
     * @param {Object} replaceFunction
     */
    static hideInnerSql(str, parts_name_escaped, replaceFunction) {
        if (str.indexOf("(") === -1 && str.indexOf(")") === -1)
            return str;

        let bracketCount = 0;
        let endCount = -1;
        let newStr = str;

        for (let i = newStr.length - 1; i >= 0; i--) {
            const ch = newStr.charAt(i);

            if (ch === ")") {
                bracketCount++;

                if (bracketCount === 1) {
                    endCount = i;
                }
            }
            else if (ch === "(") {
                bracketCount--;
                if (bracketCount === 0) {

                    let query = newStr.substring(i, endCount + 1);

                    // Hide words defined as separator but written inside brackets in the query
                    query = query.replace(new RegExp(parts_name_escaped.join('|'), 'gi'), replaceFunction);

                    newStr = newStr.substring(0, i) + query + newStr.substring(endCount + 1);
                }
            }
        }
        return newStr;
    }

    /**
     * 
     * @param {String} modifiedQuery 
     * @param {String[]} parts_name 
     * @returns {String[]}
     */
    static getPositionsOfSqlParts(modifiedQuery, parts_name) {
        // Write the position(s) in query of these separators
        const parts_order = [];

        /**
         * 
         * @param {String} _match 
         * @param {String} name 
         * @returns {String}
         */
        function realNameCallback(_match, name) {
            return name;
        }

        parts_name.forEach(item => {
            let pos = 0;
            let part = 0;

            do {
                part = modifiedQuery.indexOf(item, pos);
                if (part !== -1) {
                    const realName = item.replace(/^((\w|\s)+?)\s?\(?$/i, realNameCallback);

                    if (typeof parts_order[part] === 'undefined' || parts_order[part].length < realName.length) {
                        parts_order[part] = realName;	// Position won't be exact because the use of protect()  (above) and unprotect() alter the query string ; but we just need the order :)
                    }

                    pos = part + realName.length;
                }
            }
            while (part !== -1);
        });

        return parts_order;
    }

    /**
     * Delete duplicates (caused, for example, by JOIN and INNER JOIN)
     * @param {String[]} parts_order
     */
    static removeDuplicateEntries(parts_order) {
        let busy_until = 0;
        parts_order.forEach((item, key) => {
            if (busy_until > key) {
                delete parts_order[key];
            }
            else {
                busy_until = key + item.length;

                // Replace JOIN by INNER JOIN
                if (item.toUpperCase() === 'JOIN')
                    parts_order[key] = 'INNER JOIN';
            }
        });
    }

    /**
     * Add some # inside a string to avoid it to match a regex/split
     * @param {String} str 
     * @returns {String}
     */
    static protect(str) {
        let result = '#';
        const length = str.length;
        for (let i = 0; i < length; i++) {
            result += `${str[i]}#`;
        }
        return result;
    }

    /**
     * Restore a string output by protect() to its original state
     * @param {String} str 
     * @returns {String}
     */
    static unprotect(str) {
        let result = '';
        const length = str.length;
        for (let i = 1; i < length; i = i + 2) result += str[i];
        return result;
    }

    /**
     * 
     * @param {String[]} parts_order 
     * @param {String[]} parts 
     * @returns {Object}
     */
    static analyzeParts(parts_order, parts) {
        const result = {};
        let j = 0;
        parts_order.forEach(item => {
            const itemName = item.toUpperCase();
            j++;
            const selectComponentAst = SelectKeywordAnalysis.analyze(item, parts[j]);

            if (typeof result[itemName] !== 'undefined') {
                if (typeof result[itemName] === 'string' || typeof result[itemName][0] === 'undefined') {
                    const tmp = result[itemName];
                    result[itemName] = [];
                    result[itemName].push(tmp);
                }

                result[itemName].push(selectComponentAst);
            }
            else {
                result[itemName] = selectComponentAst;
            }

        });

        // Reorganize joins
        SqlParse.reorganizeJoins(result);

        if (typeof result.JOIN !== 'undefined') {
            result.JOIN.forEach((item, key) => { result.JOIN[key].cond = CondParser.parse(item.cond) });
        }

        SqlParse.reorganizeUnions(result);

        return result;
    }

    /**
     * 
     * @param {Object} result 
     */
    static reorganizeJoins(result) {
        const joinArr = [
            ['FULL JOIN', 'full'],
            ['RIGHT JOIN', 'right'],
            ['INNER JOIN', 'inner'],
            ['LEFT JOIN', 'left']
        ];

        for (const join of joinArr) {
            const [joinName, joinType] = join;
            SqlParse.reorganizeSpecificJoin(result, joinName, joinType);
        }
    }

    /**
     * 
     * @param {Object} result 
     * @param {String} joinName 
     * @param {String} joinType 
     */
    static reorganizeSpecificJoin(result, joinName, joinType) {
        if (typeof result[joinName] !== 'undefined') {
            if (typeof result.JOIN === 'undefined') result.JOIN = [];
            if (typeof result[joinName][0] !== 'undefined') {
                result[joinName].forEach(item => {
                    item.type = joinType;
                    result.JOIN.push(item);
                });
            }
            else {
                result[joinName].type = joinType;
                result.JOIN.push(result[joinName]);
            }
            delete result[joinName];
        }
    }

    /**
     * 
     * @param {Object} result 
     */
    static reorganizeUnions(result) {
        const astRecursiveTableBlocks = ['UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT'];

        for (const union of astRecursiveTableBlocks) {
            if (typeof result[union] === 'string') {
                result[union] = [SqlParse.sql2ast(SqlParse.parseUnion(result[union]))];
            }
            else if (typeof result[union] !== 'undefined') {
                for (let i = 0; i < result[union].length; i++) {
                    result[union][i] = SqlParse.sql2ast(SqlParse.parseUnion(result[union][i]));
                }
            }
        }
    }

    /**
     * 
     * @param {String} inStr 
     * @returns {String}
     */
    static parseUnion(inStr) {
        let unionString = inStr;
        if (unionString.startsWith("(") && unionString.endsWith(")")) {
            unionString = unionString.substring(1, unionString.length - 1);
        }

        return unionString;
    }
}

/*
 * LEXER & PARSER FOR SQL CONDITIONS
 * Inspired by https://github.com/DmitrySoshnikov/Essentials-of-interpretation
 */

/** Lexical analyzer for SELECT statement. */
class CondLexer {
    constructor(source) {
        this.source = source;
        this.cursor = 0;
        this.currentChar = "";
        this.startQuote = "";
        this.bracketCount = 0;

        this.readNextChar();
    }

    // Read the next character (or return an empty string if cursor is at the end of the source)
    readNextChar() {
        if (typeof this.source !== 'string') {
            this.currentChar = "";
        }
        else {
            this.currentChar = this.source[this.cursor++] || "";
        }
    }

    /**
     * Determine the next token
     * @returns {Object}
     */
    readNextToken() {
        if (/\w/.test(this.currentChar))
            return this.readWord();
        if (/["'`]/.test(this.currentChar))
            return this.readString();
        if (/[()]/.test(this.currentChar))
            return this.readGroupSymbol();
        if (/[!=<>]/.test(this.currentChar))
            return this.readOperator();
        if (/[+\-*/%]/.test(this.currentChar))
            return this.readMathOperator();
        if (this.currentChar === '?')
            return this.readBindVariable();

        if (this.currentChar === "") {
            return { type: 'eot', value: '' };
        }

        this.readNextChar();
        return { type: 'empty', value: '' };
    }

    /**
     * 
     * @returns {Object}
     */
    readWord() {
        let tokenValue = "";
        this.bracketCount = 0;
        let insideQuotedString = false;
        this.startQuote = "";

        while (/./.test(this.currentChar)) {
            // Check if we are in a string
            insideQuotedString = this.isStartOrEndOfString(insideQuotedString);

            if (this.isFinishedWord(insideQuotedString))
                break;

            tokenValue += this.currentChar;
            this.readNextChar();
        }

        if (/^(AND|OR)$/i.test(tokenValue)) {
            return { type: 'logic', value: tokenValue.toUpperCase() };
        }

        if (/^(IN|IS|NOT|LIKE|NOT EXISTS|EXISTS)$/i.test(tokenValue)) {
            return { type: 'operator', value: tokenValue.toUpperCase() };
        }

        return { type: 'word', value: tokenValue };
    }

    /**
     * 
     * @param {Boolean} insideQuotedString 
     * @returns {Boolean}
     */
    isStartOrEndOfString(insideQuotedString) {
        if (!insideQuotedString && /['"`]/.test(this.currentChar)) {
            this.startQuote = this.currentChar;

            return true;
        }
        else if (insideQuotedString && this.currentChar === this.startQuote) {
            //  End of quoted string.
            return false;
        }

        return insideQuotedString;
    }

    /**
     * 
     * @param {Boolean} insideQuotedString 
     * @returns {Boolean}
     */
    isFinishedWord(insideQuotedString) {
        if (insideQuotedString)
            return false;

        // Token is finished if there is a closing bracket outside a string and with no opening
        if (this.currentChar === ')' && this.bracketCount <= 0) {
            return true;
        }

        if (this.currentChar === '(') {
            this.bracketCount++;
        }
        else if (this.currentChar === ')') {
            this.bracketCount--;
        }

        // Token is finished if there is a operator symbol outside a string
        if (/[!=<>]/.test(this.currentChar)) {
            return true;
        }

        // Token is finished on the first space which is outside a string or a function
        return this.currentChar === ' ' && this.bracketCount <= 0;
    }

    /**
     * 
     * @returns {Object}
     */
    readString() {
        let tokenValue = "";
        const quote = this.currentChar;

        tokenValue += this.currentChar;
        this.readNextChar();

        while (this.currentChar !== quote && this.currentChar !== "") {
            tokenValue += this.currentChar;
            this.readNextChar();
        }

        tokenValue += this.currentChar;
        this.readNextChar();

        // Handle this case : `table`.`column`
        if (this.currentChar === '.') {
            tokenValue += this.currentChar;
            this.readNextChar();
            tokenValue += this.readString().value;

            return { type: 'word', value: tokenValue };
        }

        return { type: 'string', value: tokenValue };
    }

    /**
     * 
     * @returns {Object}
     */
    readGroupSymbol() {
        const tokenValue = this.currentChar;
        this.readNextChar();

        return { type: 'group', value: tokenValue };
    }

    /**
     * 
     * @returns {Object}
     */
    readOperator() {
        let tokenValue = this.currentChar;
        this.readNextChar();

        if (/[=<>]/.test(this.currentChar)) {
            tokenValue += this.currentChar;
            this.readNextChar();
        }

        return { type: 'operator', value: tokenValue };
    }

    /**
     * 
     * @returns {Object}
     */
    readMathOperator() {
        const tokenValue = this.currentChar;
        this.readNextChar();

        return { type: 'mathoperator', value: tokenValue };
    }

    /**
     * 
     * @returns {Object}
     */
    readBindVariable() {
        let tokenValue = this.currentChar;
        this.readNextChar();

        while (/\d/.test(this.currentChar)) {
            tokenValue += this.currentChar;
            this.readNextChar();
        }

        return { type: 'bindVariable', value: tokenValue };
    }
}

/** SQL Condition parser class. */
class CondParser {
    constructor(source) {
        this.lexer = new CondLexer(source);
        this.currentToken = {};

        this.readNextToken();
    }

    /**
     * Parse a string
     * @param {String} source 
     * @returns {Object}
     */
    static parse(source) {
        return new CondParser(source).parseExpressionsRecursively();
    }

    /**
     * Read the next token (skip empty tokens)
     * @returns {Object}
     */
    readNextToken() {
        this.currentToken = this.lexer.readNextToken();
        while (this.currentToken.type === 'empty')
            this.currentToken = this.lexer.readNextToken();
        return this.currentToken;
    }

    /**
     * Wrapper function ; parse the source
     * @returns {Object}
     */
    parseExpressionsRecursively() {
        return this.parseLogicalExpression();
    }

    /**
     * Parse logical expressions (AND/OR)
     * @returns {Object}
     */
    parseLogicalExpression() {
        let leftNode = this.parseConditionExpression();

        while (this.currentToken.type === 'logic') {
            const logic = this.currentToken.value;
            this.readNextToken();

            const rightNode = this.parseConditionExpression();

            // If we are chaining the same logical operator, add nodes to existing object instead of creating another one
            if (typeof leftNode.logic !== 'undefined' && leftNode.logic === logic && typeof leftNode.terms !== 'undefined')
                leftNode.terms.push(rightNode);
            else {
                const terms = [leftNode, rightNode].slice(0);
                leftNode = { logic, terms };
            }
        }

        return leftNode;
    }

    /**
     * Parse conditions ([word/string] [operator] [word/string])
     * @returns {Object}
     */
    parseConditionExpression() {
        let left = this.parseBaseExpression();

        if (this.currentToken.type !== 'operator') {
            return left;
        }

        let operator = this.currentToken.value;
        this.readNextToken();

        // If there are 2 adjacent operators, join them with a space (exemple: IS NOT)
        if (this.currentToken.type === 'operator') {
            operator += ` ${this.currentToken.value}`;
            this.readNextToken();
        }

        let right = null;
        if (this.currentToken.type === 'group' && (operator === 'EXISTS' || operator === 'NOT EXISTS')) {
            [left, right] = this.parseSelectExistsSubQuery();
        } else {
            right = this.parseBaseExpression(operator);
        }

        return { operator, left, right };
    }

    /**
     * 
     * @returns {Object[]}
     */
    parseSelectExistsSubQuery() {
        let rightNode = null;
        const leftNode = '""';

        this.readNextToken();
        if (this.currentToken.type === 'word' && this.currentToken.value === 'SELECT') {
            rightNode = this.parseSelectIn("", true);
            if (this.currentToken.type === 'group') {
                this.readNextToken();
            }
        }

        return [leftNode, rightNode];
    }

    // Parse base items
    /**
     * 
     * @param {String} operator 
     * @returns {Object}
     */
    parseBaseExpression(operator = "") {
        let astNode = {};

        // If this is a word/string, return its value
        if (this.currentToken.type === 'word' || this.currentToken.type === 'string') {
            astNode = this.parseWordExpression();
        }
        // If this is a group, skip brackets and parse the inside
        else if (this.currentToken.type === 'group') {
            astNode = this.parseGroupExpression(operator);
        }
        else if (this.currentToken.type === 'bindVariable') {
            astNode = this.currentToken.value;
            this.readNextToken();
        }

        return astNode;
    }

    /**
     * 
     * @returns {Object}
     */
    parseWordExpression() {
        let astNode = this.currentToken.value;
        this.readNextToken();

        if (this.currentToken.type === 'mathoperator') {
            astNode += ` ${this.currentToken.value}`;
            this.readNextToken();
            while ((this.currentToken.type === 'mathoperator' || this.currentToken.type === 'word') && this.currentToken.type !== 'eot') {
                astNode += ` ${this.currentToken.value}`;
                this.readNextToken();
            }
        }

        return astNode;
    }

    /**
     * 
     * @param {String} operator 
     * @returns {Object}
     */
    parseGroupExpression(operator) {
        this.readNextToken();
        let astNode = this.parseExpressionsRecursively();

        const isSelectStatement = typeof astNode === "string" && astNode.toUpperCase() === 'SELECT';

        if (operator === 'IN' || isSelectStatement) {
            astNode = this.parseSelectIn(astNode, isSelectStatement);
        }
        
        this.readNextToken();

        return astNode;
    }

    /**
     * 
     * @param {any} startAstNode 
     * @param {Boolean} isSelectStatement 
     * @returns {Object}
     */
    parseSelectIn(startAstNode, isSelectStatement) {
        let astNode = startAstNode;
        let inCurrentToken = this.currentToken;
        let bracketCount = 1;
        while (bracketCount !== 0 && inCurrentToken.type !== 'eot') {
            this.readNextToken();
            if (isSelectStatement) {
                astNode += ` ${inCurrentToken.value}`;
            }
            else {
                astNode += `, ${inCurrentToken.value}`;
            }

            inCurrentToken = this.currentToken;
            bracketCount += CondParser.groupBracketIncrementer(inCurrentToken);
        }

        if (isSelectStatement) {
            astNode = SqlParse.sql2ast(astNode);
        }

        return astNode;
    }

    /**
     * 
     * @param {Object} inCurrentToken 
     * @returns {Number}
     */
    static groupBracketIncrementer(inCurrentToken) {
        let diff = 0;
        if (inCurrentToken.type === 'group') {
            if (inCurrentToken.value === '(') {
                diff = 1;
            }
            else if (inCurrentToken.value === ')') {
                diff = -1;
            }
        }

        return diff
    }
}

/** Analyze each distinct component of SELECT statement. */
class SelectKeywordAnalysis {
    /**
     * 
     * @param {String} itemName 
     * @param {Object} part 
     * @returns {any}
     */
    static analyze(itemName, part) {
        const keyWord = itemName.toUpperCase().replace(/ /g, '_');

        if (typeof SelectKeywordAnalysis[keyWord] === 'undefined') {
            throw new Error(`Can't analyze statement ${itemName}`);
        }

        return SelectKeywordAnalysis[keyWord](part);
    }

    /**
     * 
     * @param {String} str 
     * @param {Boolean} isOrderBy 
     * @returns {Object[]}
     */
    static SELECT(str, isOrderBy = false) {
        const selectParts = SelectKeywordAnalysis.protect_split(',', str);
        const selectResult = selectParts.filter(item => item !== '')
            .map(item => SelectKeywordAnalysis.extractSelectField(item, isOrderBy));

        if (selectResult.length === 0) {
            throw new Error("No fields SELECTED.");
        }

        return selectResult;
    }

    /**
     * 
     * @param {String} item 
     * @param {Boolean} isOrderBy 
     * @returns {Object}
     */
    static extractSelectField(item, isOrderBy) {
        let order = "";
        if (isOrderBy) {
            const order_by = /^(.+?)(\s+ASC|DESC)?$/gi;
            const orderData = order_by.exec(item);
            if (orderData !== null) {
                order = typeof orderData[2] === 'undefined' ? "ASC" : SelectKeywordAnalysis.trim(orderData[2]);
                item = orderData[1].trim();
            }
        }

        //  Is there a column alias?
        const [name, as] = SelectKeywordAnalysis.getNameAndAlias(item);

        const splitPattern = /[\s()*/%+-]+/g;
        let terms = name.split(splitPattern);

        if (terms !== null) {
            const aggFunc = ["SUM", "MIN", "MAX", "COUNT", "AVG", "DISTINCT", "GROUP_CONCAT"];
            terms = (aggFunc.indexOf(terms[0].toUpperCase()) === -1) ? terms : null;
        }
        if (name !== "*" && terms !== null && terms.length > 1) {
            const subQuery = SelectKeywordAnalysis.parseForCorrelatedSubQuery(item);
            return { name, terms, as, subQuery, order };
        }

        return { name, as, order };
    }

    /**
     * 
     * @param {String} str 
     * @returns {Object}
     */
    static FROM(str) {
        const subqueryAst = this.parseForCorrelatedSubQuery(str);
        if (subqueryAst !== null) {
            //  If there is a subquery creating a DERIVED table, it must have a derived table name.
            //  Extract this subquery AS tableName.
            const [, alias] = SelectKeywordAnalysis.getNameAndAlias(str);
            if (alias !== "" && typeof subqueryAst.FROM !== 'undefined') {
                subqueryAst.FROM.as = alias.toUpperCase();
            }

            return subqueryAst;
        }

        let fromParts = str.split(',');
        fromParts = fromParts.map(item => SelectKeywordAnalysis.trim(item));

        const fromResult = fromParts.map(item => {
            const [table, as] = SelectKeywordAnalysis.getNameAndAlias(item);
            return { table, as };
        });

        return fromResult[0];
    }

    /**
     * 
     * @param {String} str 
     * @returns {Object}
     */
    static LEFT_JOIN(str) {
        return SelectKeywordAnalysis.allJoins(str);
    }

    /**
     * 
     * @param {String} str 
     * @returns {Object}
     */
    static INNER_JOIN(str) {
        return SelectKeywordAnalysis.allJoins(str);
    }

    /**
     * 
     * @param {String} str 
     * @returns {Object}
     */
    static RIGHT_JOIN(str) {
        return SelectKeywordAnalysis.allJoins(str);
    }

    /**
     * 
     * @param {String} str 
     * @returns {Object}
     */
    static FULL_JOIN(str) {
        return SelectKeywordAnalysis.allJoins(str);
    }

    /**
     * 
     * @param {String} str 
     * @returns {Object}
     */
    static allJoins(str) {
        const subqueryAst = this.parseForCorrelatedSubQuery(str);

        const strParts = str.toUpperCase().split(' ON ');
        const table = strParts[0].split(' AS ');
        const joinResult = {};
        joinResult.table = subqueryAst !== null ? subqueryAst : SelectKeywordAnalysis.trim(table[0]);
        joinResult.as = SelectKeywordAnalysis.trim(table[1]) || '';
        joinResult.cond = SelectKeywordAnalysis.trim(strParts[1]);

        return joinResult;
    }

    /**
     * 
     * @param {String} str 
     * @returns {Object}
     */
    static WHERE(str) {
        return CondParser.parse(str);
    }

    /**
     * 
     * @param {String} str 
     * @returns {Object[]}
     */
    static ORDER_BY(str) {
        return SelectKeywordAnalysis.SELECT(str, true);
    }

    /**
     * 
     * @param {String} str 
     * @returns {Object[]}
     */
    static GROUP_BY(str) {
        return SelectKeywordAnalysis.SELECT(str);
    }

    /**
     * 
     * @param {String} str 
     * @returns {Object[]}
     */
    static PIVOT(str) {
        const strParts = str.split(',');
        const pivotResult = [];

        strParts.forEach((item) => {
            const pivotOn = /([\w.]+)/gi;
            const pivotData = pivotOn.exec(item);
            if (pivotData !== null) {
                const tmp = {};
                tmp.name = SelectKeywordAnalysis.trim(pivotData[1]);
                tmp.as = "";
                pivotResult.push(tmp);
            }
        });

        return pivotResult;
    }

    /**
     * 
     * @param {String} str 
     * @returns {Object}
     */
    static LIMIT(str) {
        const limitResult = {};
        limitResult.nb = Number(str);
        limitResult.from = 0;
        return limitResult;
    }

    /**
     * 
     * @param {String} str 
     * @returns {Object}
     */
    static HAVING(str) {
        return CondParser.parse(str);
    }

    /**
     * 
     * @param {String} str 
     * @returns {String}
     */
    static UNION(str) {
        return SelectKeywordAnalysis.trim(str);
    }

    /**
     * 
     * @param {String} str 
     * @returns {String}
     */
    static UNION_ALL(str) {
        return SelectKeywordAnalysis.trim(str);
    }

    /**
     * 
     * @param {String} str 
     * @returns {String}
     */
    static INTERSECT(str) {
        return SelectKeywordAnalysis.trim(str);
    }

    /**
     * 
     * @param {String} str 
     * @returns {String}
     */
    static EXCEPT(str) {
        return SelectKeywordAnalysis.trim(str);
    }

    /**
     * 
     * @param {String} selectField 
     * @returns {Object}
     */
    static parseForCorrelatedSubQuery(selectField) {
        let subQueryAst = null;

        const regExp = /\(\s*(SELECT[\s\S]+)\)/i;
        const matches = regExp.exec(selectField);

        if (matches !== null && matches.length > 1) {
            subQueryAst = SqlParse.sql2ast(matches[1]);
        }

        return subQueryAst;
    }

    // Split a string using a separator, only if this separator isn't beetween brackets
    /**
     * 
     * @param {String} separator 
     * @param {String} str 
     * @returns {String[]}
     */
    static protect_split(separator, str) {
        const sep = '######';

        let inQuotedString = false;
        let quoteChar = "";
        let bracketCount = 0;
        let newStr = "";
        for (const c of str) {
            if (!inQuotedString && /['"`]/.test(c)) {
                inQuotedString = true;
                quoteChar = c;
            }
            else if (inQuotedString && c === quoteChar) {
                inQuotedString = false;
            }
            else if (!inQuotedString && c === '(') {
                bracketCount++;
            }
            else if (!inQuotedString && c === ')') {
                bracketCount--;
            }

            if (c === separator && (bracketCount > 0 || inQuotedString)) {
                newStr += sep;
            }
            else {
                newStr += c;
            }
        }

        let strParts = newStr.split(separator);
        strParts = strParts.map(item => SelectKeywordAnalysis.trim(item.replace(new RegExp(sep, 'g'), separator)));

        return strParts;
    }

    /**
     * 
     * @param {any} str 
     * @returns {any}
     */
    static trim(str) {
        if (typeof str === 'string')
            return str.trim();
        return str;
    }

    /**
    * If an ALIAS is specified after 'AS', return the field/table name and the alias.
    * @param {String} item 
    * @returns {String[]}
    */
    static getNameAndAlias(item) {
        let realName = item;
        let alias = "";
        const lastAs = SelectKeywordAnalysis.lastIndexOfOutsideLiteral(item.toUpperCase(), " AS ");
        if (lastAs !== -1) {
            const subStr = item.substring(lastAs + 4).trim();
            if (subStr.length > 0) {
                alias = subStr;
                //  Remove quotes, if any.
                if ((subStr.startsWith("'") && subStr.endsWith("'")) ||
                    (subStr.startsWith('"') && subStr.endsWith('"')) ||
                    (subStr.startsWith('[') && subStr.endsWith(']')))
                    alias = subStr.substring(1, subStr.length - 1);

                //  Remove everything after 'AS'.
                realName = item.substring(0, lastAs).trim();
            }
        }

        return [realName, alias];
    }

    /**
     * 
     * @param {String} srcString 
     * @param {String} searchString 
     * @returns {Number}
     */
    static lastIndexOfOutsideLiteral(srcString, searchString) {
        let index = -1;
        let inQuote = "";

        for (let i = 0; i < srcString.length; i++) {
            const ch = srcString.charAt(i);

            if (inQuote !== "") {
                //  The ending quote.
                if ((inQuote === "'" && ch === "'") || (inQuote === '"' && ch === '"') || (inQuote === "[" && ch === "]"))
                    inQuote = "";
            }
            else if ("\"'[".indexOf(ch) !== -1) {
                //  The starting quote.
                inQuote = ch;
            }
            else if (srcString.substring(i).startsWith(searchString)) {
                //  Matched search.
                index = i;
            }
        }

        return index;
    }
}

// @author Chris Demmings - https://demmings.github.io/


class Select2Query {
    /**
     * 
     * @param  {...any} parms 
     * @returns {Select2Query}
     */
    setTables(...parms) {
        this.tables = Select2Query.addTableData(parms);
        return this;
    }

    /**
     * 
     * @param {Map<String,String>} tables 
     * @returns {Select2Query}
     */
    setTableMap(tables) {
        this.tables = tables;
        return this;
    }

    /**
     * 
     * @param {any} selectStatement 
     * @returns {String}
     */
    convert(selectStatement) {
        let queryStatement = "";
        let ast = null;
        let query = "";

        if (typeof selectStatement === 'string') {
            try {
                ast = SqlParse.sql2ast(selectStatement);
            }
            catch (ex) {
                return ex.toString();
            }
        }
        else {
            ast = selectStatement;
        }

        if (typeof ast.JOIN !== 'undefined') {
            const joinQuery = new QueryJoin(this.tables);
            query = joinQuery.join(ast);
        }
        else {
            queryStatement = Select2Query.selectFields(ast);
            queryStatement += this.whereCondition(ast);
            queryStatement += Select2Query.groupBy(ast);
            queryStatement += Select2Query.orderBy(ast);

            query = this.formatAsQuery(queryStatement, ast.FROM.table);
        }

        return query;
    }

    /**
     * 
     * @param {String} statement 
     * @param {String} tableName 
     * @returns {String}
     */
    formatAsQuery(statement, tableName) {
        const range = this.tables.has(tableName.toUpperCase()) ? this.tables.get(tableName.toUpperCase()) : "";

        return `=QUERY(${range}, "${statement}")`;
    }

    /**
     * 
     * @param {String[]} parms 
     * @returns {Map<String,String>}
     */
    static addTableData(parms) {
        const tables = new Map();

        //  Should be:  TABLE NAME, TABLE RANGE, name, range, name, range,...
        let i = 0;
        while (i + 1 < parms.length) {
            tables.set(parms[i].trim().toUpperCase(), parms[i + 1]);
            i += 2;
        }

        return tables;
    }

    /**
     * 
     * @param {Object} ast 
     * @returns {String}
     */
    static selectFields(ast) {
        let selectStr = "SELECT ";
        if (typeof ast.SELECT !== 'undefined') {
            for (let i = 0; i < ast.SELECT.length; i++) {
                const fld = ast.SELECT[i];

                let fieldName = fld.name;
                if (fld.name.indexOf(".") !== -1) {
                    const parts = fld.name.split(".");
                    fieldName = parts[1];
                }
                selectStr += fieldName.toUpperCase();

                if (i + 1 < ast.SELECT.length) {
                    selectStr += ", ";
                }
            }
        }

        return selectStr;
    }

    /**
     * Retrieve filtered record ID's.
     * @param {Object} ast - Abstract Syntax Tree
     * @returns {String} - Query WHERE condition.
     */
    whereCondition(ast) {
        let queryWhere = "";

        let conditions = {};
        if (typeof ast.WHERE !== 'undefined') {
            conditions = ast.WHERE;
        }
        else {
            //  Entire table is selected.  
            return queryWhere;
        }

        if (typeof conditions.logic === 'undefined')
            queryWhere = this.resolveCondition("OR", [conditions], "");
        else
            queryWhere = this.resolveCondition(conditions.logic, conditions.terms, "");

        return ` WHERE ${queryWhere.trim()}`;
    }

    /**
    * Recursively resolve WHERE condition and then apply AND/OR logic to results.
    * @param {String} logic - logic condition (AND/OR) between terms
    * @param {Object} terms - terms of WHERE condition (value compared to value)
    * @returns {String} - condition of where 
    */
    resolveCondition(logic, terms, queryWhere) {

        for (let i = 0; i < terms.length; i++) {
            const cond = terms[i];

            if (typeof cond.logic === 'undefined') {
                queryWhere += this.whereString(cond);
            }
            else {
                queryWhere = this.resolveCondition(cond.logic, cond.terms, queryWhere);
            }

            if (i + 1 < terms.length) {
                queryWhere += ` ${logic}`;
            }
        }

        return queryWhere;
    }

    /**
     * 
     * @param {Object} cond 
     * @returns {String}
     */
    whereString(cond) {
        let whereStr = "";

        switch (cond.operator) {
            case "NOT IN":
                whereStr = ` NOT ${this.whereValue(cond.left)} ${Select2Query.whereOp("IN")} ${this.whereValue(cond.right)}`;
                break;
            case "IN":
            default:
                whereStr = ` ${this.whereValue(cond.left)} ${Select2Query.whereOp(cond.operator)} ${this.whereValue(cond.right)}`;
                break;
        }

        return whereStr;
    }

    /**
     * 
     * @param {String} operator 
     * @returns {String}
     */
    static whereOp(operator) {
        if (operator.trim().toUpperCase() === 'IN')
            return "MATCHES";

        return operator;
    }

    /**
     * 
     * @param {Object} cond 
     * @returns {String}
     */
    whereValue(cond) {
        if (typeof cond.SELECT === 'undefined') {
            return cond;
        }
        else {
            const sql = new Select2Query().setTableMap(this.tables)

            const preTextJoin = "'\"&TEXTJOIN(\"|\", true, ";
            const postTextJoin = ")&\"'";
            const query = sql.convert(cond).slice(1);       //  Get rid of starting '='.
            return preTextJoin + query + postTextJoin;
        }
    }

    /**
     * 
     * @param {Object} ast 
     * @returns {String}
     */
    static orderBy(ast) {
        let orderBy = "";

        if (typeof ast['ORDER BY'] === 'undefined') {
            return orderBy;
        }

        orderBy = " ORDER BY "
        for (let i = 0; i < ast['ORDER BY'].length; i++) {
            const order = ast['ORDER BY'][i];
            orderBy += `${order.name} ${order.order.toUpperCase()}`;

            if (i + 1 < ast['ORDER BY'].length) {
                orderBy += ", ";
            }
        }

        return orderBy;
    }

    /**
     * 
     * @param {Object} ast 
     * @returns {String}
     */
    static groupBy(ast) {
        let groupBy = "";

        if (typeof ast['GROUP BY'] === 'undefined') {
            return groupBy;
        }

        groupBy += " GROUP BY ";

        for (let i = 0; i < ast['GROUP BY'].length; i++) {
            const order = ast['GROUP BY'][i];
            groupBy += order.name;

            if (i + 1 < ast['GROUP BY'].length) {
                groupBy += ", ";
            }
        }

        return groupBy;
    }
}

class QueryJoin {
    /**
     * 
     * @param {Map<String,String>} tables 
     */
    constructor(tables) {
        this.tables = tables;
    }

    /**
     * 
     * @param {Object} ast 
     * @returns {String}
     */
    join(ast) {
        let query = "";

        for (const joinAst of ast.JOIN) {
            query += this.joinCondition(ast.FROM.table, ast.SELECT, joinAst, ast);
        }

        return query;
    }

    /**
     * @param {String} leftTable
     * @param {Object} selectFields
     * @param {Object} joinAst 
     * @param {Object} ast
     * @returns {String}
     */
    joinCondition(leftTable, selectFields, joinAst, ast) {
        const LEFT_KEY_RANGE = "$$LEFT_KEY$$";
        const LEFT_SELECT_FIELDS = "$$LEFT_SELECT$$";
        const RIGHT_KEY_RANGE = "$$RIGHT_KEY$$";
        const RIGHT_SELECT_FIELDS = "$$RIGHT_SELECT$$";
        const NO_MATCH_QUERY = "$$NO_MATCH$$";

        let query = "";
        let rightTable = joinAst.table;
        let conditionLeft = joinAst.cond.left;
        let conditionRight = joinAst.cond.right

        if (joinAst.type === 'right') {
            let temp = leftTable;
            leftTable = rightTable;
            rightTable = temp;

            temp = conditionLeft;
            conditionLeft = conditionRight;
            conditionRight = temp;
        }

        const leftKeyRangeValue = this.getKeyRangeString(leftTable, conditionLeft);
        const rightKeyRangeValue = this.getKeyRangeString(rightTable, conditionRight);
        const leftSelectFieldValue = this.leftSelectFields(selectFields, leftTable);
        let rightSelectFieldValue = this.rightSelectFields(selectFields, rightTable);
        const notFoundQuery = this.selectNotInJoin(ast, joinAst, leftTable, rightTable);

        if (leftSelectFieldValue !== '' && rightSelectFieldValue !== '') {
            rightSelectFieldValue = `&"!"&${rightSelectFieldValue}`;
        }

        const joinFormatString = '={ArrayFormula(Split(Query(Flatten(IF($$LEFT_KEY$$=Split(Textjoin("!",1,$$RIGHT_KEY$$),"!"),$$LEFT_SELECT$$ $$RIGHT_SELECT$$,)),"Where Col1!=\'\'"),"!"))$$NO_MATCH$$}';

        query = joinFormatString.replace(LEFT_KEY_RANGE, leftKeyRangeValue);
        query = query.replace(RIGHT_KEY_RANGE, rightKeyRangeValue);
        query = query.replace(LEFT_SELECT_FIELDS, leftSelectFieldValue);
        query = query.replace(RIGHT_SELECT_FIELDS, rightSelectFieldValue);
        query = query.replace(NO_MATCH_QUERY, notFoundQuery);

        const sql = new Select2Query();
        sql.setTableMap(this.tables);

        return query;
    }

    /**
     * 
     * @param {String} tableName 
     * @param {String} condition 
     * @returns {String}
     */
    getKeyRangeString(tableName, condition) {
        const tableInfo = this.tables.get(tableName.toUpperCase());
        let field = condition;
        if (condition.indexOf(".") !== -1) {
            const parts = condition.split(".");
            field = parts[1];
        }
        let range = tableInfo;
        let rangeTable = "";
        if (range.indexOf("!") !== -1) {
            const parts = range.split("!");
            rangeTable = `${parts[0]}!`;
            range = parts[1];
        }

        const rangeComponents = range.split(":");
        const startRange = QueryJoin.replaceColumn(rangeComponents[0], field);
        const endRange = QueryJoin.replaceColumn(rangeComponents[1], field);

        return `${rangeTable}${startRange}:${endRange}`;
    }

    /**
     * 
     * @param {String} rowColumn 
     * @param {String} newColumn 
     * @returns {String}
     */
    static replaceColumn(rowColumn, newColumn) {
        const num = rowColumn.replace(/\D/g, '');
        return newColumn + num;
    }

    /**
     * 
     * @param {Object} ast 
     * @param {Object} joinAst 
     * @param {String} leftTable 
     * @param {String} rightTable 
     * @returns {String}
     */
    selectNotInJoin(ast, joinAst, leftTable, rightTable) {
        if (joinAst.type === 'inner') {
            return "";
        }

        leftTable = leftTable.toUpperCase();

        //  Sort fields so that LEFT table are first and RIGHT table are after.
        const sortedFields = QueryJoin.sortSelectJoinFields(ast, leftTable);

        const selectFlds = QueryJoin.createSelectFieldsString(sortedFields);
        const label = QueryJoin.createSelectLabelString(sortedFields);
        const rightFieldName = QueryJoin.getJoinField(joinAst, joinAst.cond.right, joinAst.cond.left);
        const leftFieldName = QueryJoin.getJoinField(joinAst, joinAst.cond.left, joinAst.cond.right);
        const leftRange = this.tables.get(leftTable.toUpperCase());
        const rightRange = this.tables.get(rightTable.toUpperCase());

        const queryStart = `QUERY(${leftRange},`;
        let selectStr = `${queryStart}"select ${selectFlds} where ${rightFieldName} is not null and NOT ${rightFieldName} MATCHES `;

        const matchesQuery = `'"&TEXTJOIN("|", true, QUERY(${rightRange}, "SELECT ${leftFieldName} where ${leftFieldName} is not null"))&`;
        selectStr += matchesQuery;
        selectStr = `${selectStr}${label}", 0)`;

        //  If no records are found, we need to insert an empty record - otherwise we get an array error.
        selectStr = `;IFNA(${selectStr},${QueryJoin.ifNaResult(ast)})`;


        return selectStr;
    }

    /**
     * 
     * @param {Object} joinAst 
     * @param {String} rightSide 
     * @param {String} leftSide 
     * @returns {String}
     */
    static getJoinField(joinAst, rightSide, leftSide) {
        let fieldName = "";
        if (joinAst.type === 'right') {
            fieldName = rightSide;
        }
        else {
            fieldName = leftSide;
        }
        if (fieldName.indexOf(".") !== -1) {
            const parts = fieldName.split(".");
            fieldName = parts[1];
        }

        return fieldName;
    }

    /**
     * @typedef {Object} JoinSelectField
     * @property {String} fieldTable
     * @property {String} fieldName
     * @property {Boolean} isNull
     */

    /**
     * @param {Object} ast 
     * @param {String} leftTable
     * @returns {JoinSelectField[]}
     */
    static sortSelectJoinFields(ast, leftTable) {
        //  Sort fields so that LEFT table are first and RIGHT table are after.
        const leftFields = [];
        const rightFields = [];
        let nullCnt = 1;

        for (const fld of ast.SELECT) {
            let fieldTable = leftTable.toUpperCase();
            let fieldName = fld.name.toUpperCase();
            if (fld.name.indexOf(".") !== -1) {
                const parts = fld.name.split(".");
                fieldTable = parts[0].toUpperCase();
                fieldName = parts[1].toUpperCase();
            }

            const isNull = false;
            const fieldInfo = {
                fieldTable,
                fieldName,
                isNull
            };

            if (fieldTable === leftTable) {
                leftFields.push(fieldInfo);
            }
            else {
                fieldInfo.fieldName = `'null${" ".repeat(nullCnt)}'`;
                fieldInfo.isNull = true;
                nullCnt++;
                rightFields.push(fieldInfo);
            }
        }

        return leftFields.concat(rightFields);
    }

    /**
     * Build a string that will be used in IFNA() when select does not find any records.
     * @param {Object} ast 
     * @returns {String}
     */
    static ifNaResult(ast) {
        let naResult = "";

        ast.SELECT.forEach(_element => {
            naResult = (naResult === '') ? "" : `${naResult},`;
            naResult += '""';
        });

        if (naResult !== "") {
            naResult = `{${naResult}}`;
        }

        return naResult;
    }

    /**
     * 
     * @param {JoinSelectField[]} sortedFields 
     * @returns {String}
     */
    static createSelectFieldsString(sortedFields) {
        let selectFlds = "";

        for (const fld of sortedFields) {
            selectFlds = (selectFlds === '' ? '' : `${selectFlds},`) + fld.fieldName;
        }

        return selectFlds;
    }

    /**
    * 
    * @param {JoinSelectField[]} sortedFields 
    * @returns {String}
    */
    static createSelectLabelString(sortedFields) {
        let label = "";

        for (const fld of sortedFields) {
            if (fld.isNull) {
                label = label !== "" ? `${label}, ` : "";
                label += `${fld.fieldName} ''`;
            }
        }

        if (label !== "") {
            label = `"' label ${label}`;
        }

        return label;
    }

    /**
     * Assembled selected fields string for LEFT.
     * @param {Object} ast 
     * @param {String} leftTable 
     * @returns {String}
     */
    leftSelectFields(ast, leftTable) {
        let leftSelect = "";

        for (const fld of ast) {
            let selectField = "";

            if (fld.name.indexOf(".") === -1) {
                selectField = fld.name;
            }
            else {
                const parts = fld.name.split(".");
                if (parts[0].toUpperCase() === leftTable.toUpperCase()) {
                    selectField = parts[1];
                }
            }

            let rangeTable = "";
            let range = "";
            if (selectField !== "") {
                const tableInfo = this.tables.get(leftTable.toUpperCase());

                if (tableInfo.indexOf("!") !== -1) {
                    const parts = tableInfo.split("!");
                    rangeTable = `${parts[0]}!`;
                    range = parts[1];
                }

                const rangeComponents = range.split(":");
                const startRange = QueryJoin.replaceColumn(rangeComponents[0], selectField);
                const endRange = QueryJoin.replaceColumn(rangeComponents[1], selectField);

                selectField = `${rangeTable}${startRange}:${endRange}`;

                leftSelect = leftSelect === '' ? '' : `${leftSelect}&"!"& `;

                leftSelect += `IF(${selectField} <> "",${selectField}, " ")`;
            }
        }

        return leftSelect;
    }

    /**
     * assemble SELECTED FIELDS string for RIGHT.
     * @param {Object} ast 
     * @param {String} rightTable 
     * @returns {String}
     */
    rightSelectFields(ast, rightTable) {
        let rightSelect = "";

        for (const fld of ast) {
            let selectField = "";

            if (fld.name.indexOf(".") === -1) {
                selectField = fld.name;
            }
            else {
                const parts = fld.name.split(".");
                if (parts[0].toUpperCase() === rightTable.toUpperCase()) {
                    selectField = parts[1];
                }
            }

            let rangeTable = "";
            let range = "";
            if (selectField !== "") {
                const tableInfo = this.tables.get(rightTable.toUpperCase());

                if (tableInfo.indexOf("!") !== -1) {
                    const parts = tableInfo.split("!");
                    rangeTable = `${parts[0]}!`;
                    range = parts[1];
                }

                const rangeComponents = range.split(":");
                const startRange = QueryJoin.replaceColumn(rangeComponents[0], selectField);
                const endRange = QueryJoin.replaceColumn(rangeComponents[1], selectField);

                const columnRange = `${rangeTable}${startRange}:${endRange}`;

                rightSelect = rightSelect === '' ? '' : `${rightSelect}&"!"& `;

                rightSelect += `Split(Textjoin("!",1,IF(${columnRange}<>"",${columnRange}," ")),"!")`;
            }
        }

        return rightSelect;
    }
}

