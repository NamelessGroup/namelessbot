/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * All credits for this go to
 * https://web.stanford.edu/class/cs103/tools/truth-table-tool/
 * Code stolen to a large amount and just adopted & typescript-ified
 */

//region AST Classes
interface Node {
    evaluate(assignment: boolean[]): boolean;
    toString(variables: string[]): string;
}

class TrueNode implements Node {
    evaluate(assignment: boolean[]): boolean {
        return true;
    }
    toString(variables: string[]): string {
        return "T";
    }
}

class FalseNode implements Node {
    evaluate(assignment: boolean[]): boolean {
        return false;
    }
    toString(variables: string[]): string {
        return "F";
    }
}

class NegateNode implements Node {
    private underlying: Node;
    constructor(underlying: Node) {
        this.underlying = underlying;
    }
    evaluate(assignment: boolean[]): boolean {
        return !this.underlying.evaluate(assignment);
    }
    toString(variables: string[]): string {
        return "!" + this.underlying.toString(variables);
    }
}

class AndNode implements Node {
    private lhs: Node;
    private rhs: Node;
    constructor(lhs: Node, rhs: Node) {
        this.lhs = lhs;
        this.rhs = rhs;
    }
    evaluate(assignment: boolean[]): boolean {
        return this.lhs.evaluate(assignment) && this.rhs.evaluate(assignment);
    }
    toString(variables: string[]): string {
        return "(" + this.lhs.toString(variables) + " & " + this.rhs.toString(variables) + ")";
    }
}

class OrNode implements Node {
    private lhs: Node;
    private rhs: Node;
    constructor(lhs: Node, rhs: Node) {
        this.lhs = lhs;
        this.rhs = rhs;
    }
    evaluate(assignment: boolean[]): boolean {
        return this.lhs.evaluate(assignment) || this.rhs.evaluate(assignment);
    }
    toString(variables: string[]): string {
        return "(" + this.lhs.toString(variables) + " | " + this.rhs.toString(variables) + ")";
    }
}

class ImpliesNode implements Node {
    private lhs: Node;
    private rhs: Node;
    constructor(lhs: Node, rhs: Node) {
        this.lhs = lhs;
        this.rhs = rhs;
    }
    evaluate(assignment: boolean[]): boolean {
        return !this.lhs.evaluate(assignment) || this.rhs.evaluate(assignment);
    }
    toString(variables: string[]): string {
        return "(" + this.lhs.toString(variables) + " -> " + this.rhs.toString(variables) + ")";
    }
}

class IffNode implements Node {
    private lhs: Node;
    private rhs: Node;
    constructor(lhs: Node, rhs: Node) {
        this.lhs = lhs;
        this.rhs = rhs;
    }
    evaluate(assignment: boolean[]): boolean {
        return this.lhs.evaluate(assignment) === this.rhs.evaluate(assignment);
    }
    toString(variables: string[]): string {
        return "(" + this.lhs.toString(variables) + " <-> " + this.rhs.toString(variables) + ")";
    }
}

class VariableNode implements Node {
    private readonly index: number;
    constructor(index: number) {
        this.index = index;
    }
    evaluate(assignment: boolean[]): boolean {
        return assignment[this.index];
    }
    toString(variables: string[]): string {
        return variables[this.index];
    }
}
//endregion

//region Scanner
interface Token {
    type: string;
    start: number;
    end: number;
    index?: string | number;
}
interface PreliniaryScanResult {
    tokens: Token[],
    variableSet: { [variable: string]: boolean | number };
}
interface ScanResult {
    tokens: Token[];
    variables: string[];
}

const EOF_TOKEN = "$"

function scan(input: string): ScanResult {

    // Check for illegal characters
    const okayChars = /[A-Za-z_\d\\/<>\-~^()\s&|=!\u2227\u2228\u2192\u2194\u22A4\u22A5\u00AC]/;
    for (let i = 0; i < input.length; i++) {
        if (!okayChars.test(input.charAt(i))) {
            throw new Error(`Illegal character '${input.charAt(i)}' at position ${i+1}`);
        }
    }

    /*
     * Append a special $ marker to the end of the input. This will serve as our
     * EOF marker and eliminates a lot of special cases in input handling.
     */

    input += EOF_TOKEN;
    let i = 0;
    const variableSet: { [variable: string]: boolean } = {};
    const tokens: Token[] = [];

    while(i <= input.length) {
        const curr = input.charAt(i);

        if (curr === EOF_TOKEN) {
            tokens.push(makeIdentityToken(curr, i));
            return transformVariableSet({
                tokens,
                variableSet
            })
        } else {
            const variable = readVariable(input, i);
            const operator = readOperator(input, i);
            if (variable) {
                variableSet[variable] = true;
                tokens.push(makeVariableToken(variable, i, i + variable.length));
                i += variable.length;
            } else if (operator) {
                tokens.push(makeIdentityToken(operator, i));
                i += operator.length;
            } else if (isWhitespace(input.charAt(i))) {
                i++;
            } else {
                throw new Error(`The character '${input.charAt(i)} shouldn't appear in position ${i}.`);
            }
        }
    }

}

function makeIdentityToken(str: string, index: number): Token {
    return {
        type: translate(str),
        start: index,
        end: index + str.length
    }
}

function makeVariableToken(varIndex: string, start: number, end: number): Token {
    return {
        type: "variable",
        index: varIndex,
        start,
        end
    }
}

function readVariable(str: string, index: number): string {
    if (!/[a-z_]/.test(str.charAt(index))) {
        return null;
    }
    let result = "";
    while (/[a-z_A-Z]/.test(str.charAt(index))) {
        result += str.charAt(index);
        index++;
    }
    if (["and", "or", "not", "iff", "implies", "true", "false", "nimplies", "implies", "nequals",
         "equals", "nand", "niff", "neql", "eql", "nor"]. includes(result)) return null;
    return result;
}

function readOperator(str: string, index: number): string {
    // Eight-char operators
    if (index < str.length - 7) {
        const eightChars = str.substring(index, index + 8);
        if (eightChars === "nimplies") return eightChars;
    }

    // Seven-char operators
    if (index < str.length - 6) {
        const sevenChars = str.substring(index, index + 7);
        if (sevenChars === "implies" || sevenChars === "nequals") return sevenChars;
    }

    if (index < str.length - 5) {
        const sixChars = str.substring(index, index + 6);
        if (sixChars === "equals") return sixChars;
    }

    // Five-char operators
    if (index < str.length - 4) {
        const fiveChars = str.substring(index, index + 5);
        if (fiveChars === "false") return fiveChars;
    }

    // Four-char operators
    if (index < str.length - 3) {
        const fourChars = str.substring(index, index + 4);
        if (["true", "nand", "niff", "neql", "!<=>", "!<->"].includes(fourChars)) return fourChars;
    }

    // Three-char operators
    if (index < str.length - 2) {
        const threeChars = str.substring(index, index + 3);
        if (["<->", "and", "<=>", "not", "iff", "eql", "nor", "!->", "!=>", "-!>", "=!>", "<!>", "!&&", "!||", "!\\/", "!/\\"].includes(threeChars)) return threeChars;
    }

    // Two-char operators
    if (index < str.length - 1) {
        const twoChars = str.substring(index, index + 2);
        if (twoChars === "/\\" || twoChars === "\\/" || twoChars === "->" ||
            twoChars === "&&"  || twoChars === "||"  || twoChars === "or" ||
            twoChars === "=>"  || twoChars === "!&"  || twoChars === "!|") return twoChars;
    }

    // Single-char operators
    if (/[()~!TF&|]/.test(str.charAt(index))) return str.charAt(index);

    return null;
}

function translate(input: string): string {
    if (input === "/\\" || input === "&&" || input === "and") return "&";
    if (input === "\\/" || input === "||" || input === "or") return "|";
    if (input === "=>"  || input === "implies") return "->";
    if (input === "<=>" || input === "iff" || input === "equals" || input === "eql") return "<->";
    if (input === "not" || input === "~") return "!";
    if (input === "true") return "T";
    if (input === "false") return "F";
    if (input === "!&&" || input === "!/\\" || input === "nand") return "!&";
    if (input === "!||" || input === "!\\/" || input === "nor") return "!|";
    if (input === "<!>" || input === "niff" || input === "nequals" || input === "neql" || input === "!<=>") return "!<->";
    if (input === "-!>" || input === "=!>" || input === "!=>" || input === "nimplies") return "!->";
    return input;
}

function isWhitespace(str: string): boolean {
    return /\s/.test(str);
}

function transformVariableSet(preliminary: PreliniaryScanResult): ScanResult {
    const variables = [];
    for (const key in preliminary.variableSet) {
        variables.push(key);
    }

    variables.sort();

    // Preparation for easier lookup
    for (let i = 0; i < variables.length; i++) {
        preliminary.variableSet[variables[i]] = i;
    }

    for (let j = 0; j < preliminary.tokens.length; j++) {
        if (preliminary.tokens[j].type === "variable") {
            preliminary.tokens[j].index = preliminary.variableSet[preliminary.tokens[j].index] as number;
        }
    }

    return {
        tokens: preliminary.tokens,
        variables
    }
}
//endregion

//region Parser
interface ParserResult {
    ast: Node;
    variables: string[];
}

export function parse(input: string): ParserResult {
    const scanResult = scan(input);
    const tokens = scanResult.tokens;

    /*
     * Use Dijkstra's shunting-yard algorithm to convert from infix to postfix,
     * building the AST as we go. This means we need to track the operators and
     * operands (where the operands stack also includes parentheses.)
     *
     * The ~ operator is odd in that it modifies something we haven't seen yet.
     * To handle this, we push it onto the operands stack. Whenever we read
     * an operand, we repeatedly pop off negations until none remain.
     */
    const operators: Token[] = [];
    const operands: Node[] = [];

    /*
     * We can be in one of two different states:
     *
     *  needOperand: We're expecting something that ultimately evaluates to an expression. This can be
     *               T, F, a variable, a negation of something, or a parenthesis.
     * !needOperand: We've got the operand, and now we're expecting an operator to be applied to it. We
     *               can also get a close parenthesis.
     *
     */
    let needOperand = true;

    for (const i in tokens) {
        const currToken = tokens[i];

        if (needOperand) {
            if (isOperand(currToken)) {
                addOperand(wrapOperand(currToken), operands, operators);
                needOperand = false;
            } else if(currToken.type === "(" || currToken.type === "!") {
                operators.push(currToken);
            } else if(currToken.type === EOF_TOKEN) {
                if (operators.length === 0) {
                    throw new Error("Please input an expression.");
                }
                if (topOf(operators).type === "(") {
                    throw new Error("Missing closing parenthesis.");
                }
                throw new Error("Missing an operand.");
            } else {
                throw new Error("Missing a variable, constant or open parenthesis.");
            }
        } else {
            if (isBinaryOperator(currToken) || currToken.type === EOF_TOKEN) {
                // eslint-disable-next-line no-constant-condition
                while (true) {
                    if (operators.length === 0) break;
                    if (topOf(operators).type === "(") break;
                    if (priorityOf(topOf(operators)) <= priorityOf(currToken)) break;

                    const operator = operators.pop();
                    const rhs = operands.pop();
                    const lhs = operands.pop();

                    addOperand(createOperatorNode(lhs, operator, rhs), operands, operators);
                }

                operators.push(currToken);
                needOperand = true;
                if (currToken.type == EOF_TOKEN) break;
            } else if (currToken.type === ")") {
                // eslint-disable-next-line no-constant-condition
                while (true) {
                    if (operators.length === 0) {
                        throw new Error("Missing open parenthesis.");
                    }
                    const currOp = operators.pop();
                    if (currOp.type === "(") break;
                    if (currOp.type === "!") throw new Error("Useless negation operator.");
                    const rhs = operands.pop();
                    const lhs = operands.pop();
                    addOperand(createOperatorNode(lhs, currOp, rhs), operands, operators);
                }
                const expr = operands.pop();
                addOperand(expr, operands, operators);
            } else {
                throw new Error("Missing closing parenthesis or binary operator.")
            }
        }
    }

    if (operators.length === 0) throw new Error("No operators on the operator stack (logic error in parser?)");
    if (operators.pop().type !== EOF_TOKEN) throw new Error("Stack top is not EOF (logic error in parser?)");

    if (operators.length !== 0) {
        const mismatchedOp = operators.pop();
        if (mismatchedOp.type !== "(") throw new Error("Somehow missed an operator factoring in EOF (logic error in parser?)");
        throw new Error("Missing closing parenthesis.");
    }

    return {
        ast: operands.pop(),
        variables: scanResult.variables
    }
}

function addOperand(node: Node, operands: Node[], operators: Token[]): void {
    while (operators.length > 0 && topOf(operators).type === "!") {
        operators.pop();
        node = new NegateNode(node);
    }
    operands.push(node);
}

function isOperand(token: Token): boolean {
    return token.type === "T" ||
        token.type === "F" ||
        token.type === "variable";
}

function wrapOperand(token: Token): Node {
    if (token.type === "T") return new TrueNode();
    if (token.type === "F") return new FalseNode();
    if (token.type === "variable") return new VariableNode(token.index as number);
    throw new Error(`Unreachable code error: Token ${token.type} isn't an operand.`);
}

function isBinaryOperator(token: Token): boolean {
    return token.type === "<->" ||
        token.type === "->" ||
        token.type === "|" ||
        token.type === "&" ||
        token.type === "!&" ||
        token.type === "!|" ||
        token.type === "!->" ||
        token.type === "!<->";
}

function priorityOf(token: Token): number {
    if (token.type === EOF_TOKEN) return -1;
    if (token.type === "<->" || token.type === "!<->") return 0;
    if (token.type === "->" || token.type === "!->")  return 1;
    if (token.type === "|" || token.type === "!|") return 2;
    if (token.type === "&" || token.type === "!&") return 3;
    throw new Error(`Unreachable code error: Should never need the priority of ${token.type}`);
}

function createOperatorNode(lhs: Node, token: Token, rhs: Node): Node {
    if (token.type === "<->") return new IffNode(lhs, rhs);
    if (token.type === "->") return new ImpliesNode(lhs, rhs);
    if (token.type === "|") return new OrNode(lhs, rhs);
    if (token.type === "&") return new AndNode(lhs, rhs);
    if (token.type === "!<->") return new NegateNode(new IffNode(lhs, rhs));
    if (token.type === "!->") return new NegateNode(new ImpliesNode(lhs, rhs));
    if (token.type === "!|") return new NegateNode(new OrNode(lhs, rhs));
    if (token.type === "!&") return new NegateNode(new AndNode(lhs, rhs));
    throw new Error(`Unreachable code error: Should never create an operator node from ${token.type}`);
}

function topOf<Type>(array: Type[]): Type {
    if (array.length === 0) {
        throw new Error("Cant get the top of an empty array.");
    }
    return array[array.length - 1];
}
//endregion

//region GenerateTruthTable
interface TruthTable {
    variables: string[];
    results: { assignment: boolean[]; result: boolean; }[];
}

export function generateTruthTable(parseResult: ParserResult): TruthTable {
    const results = [];

    const assignment = [];
    for (let i = 0; i < parseResult.variables.length; i++) {
        assignment.push(false);
    }

    do {
        results.push({ assignment: [...assignment], result: parseResult.ast.evaluate(assignment) });
    } while (nextAssignment(assignment));

    return {
        variables: parseResult.variables,
        results
    }
}

function nextAssignment(assignment: boolean[]): boolean {
    let flipIndex = assignment.length - 1;
    while (flipIndex >= 0 && assignment[flipIndex]) flipIndex--;

    if (flipIndex === -1) return false;

    assignment[flipIndex] = true;
    for (let i = flipIndex + 1; i < assignment.length; i++) {
        assignment[i] = false;
    }
    return true;
}
//endregion
