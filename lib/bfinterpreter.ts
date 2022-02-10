import {CommandInteraction} from "discord.js";

export enum InterpreterMode {
    INPUT_BEHIND_COMMA,
    REQUEST_INPUT
}

export class BrainfuckInterpreter {
    posarray: number[] = new Array(1);
    negarray: number[] = new Array(0);
    pointer = 0;
    endString = "";
    readonly code: string;
    interpreterMode:InterpreterMode = InterpreterMode.INPUT_BEHIND_COMMA;

    constructor(c: string, im?: InterpreterMode, ci?:CommandInteraction ) {
        this.code = c
        this.posarray[0] = 0
        if (im != undefined) {
            this.interpreterMode = im;
        }
        this.checkCode();
        this.execute()
    }

    checkCode() {
        const charar = this.code.split("");
        let counter = 0;
        for (let i = 0; i < charar.length; i++) {
            if(charar[i] == "[") {
                ++counter;
            } else if( charar[i] == "]") {
                --counter;
            }
            if(counter < 0) {
                // todo: better error
                throw new SyntaxError("wrong loops");
            }
        }
        if (counter != 0) {
            // todo: better error
            throw new SyntaxError("wrong loops");
        }
    }

    execute() {
        const charar = this.code.split("");
        const brackets = new Array(0);
        for (let i = 0; i < charar.length; i++) {
            switch (charar[i]) {
                case '+': {
                    this.inc();
                    break;
                }
                case '-': {
                    this.dec();
                    break;
                }
                case '<': {
                    this.decPointer();
                    break;
                }
                case '>': {
                    this.incPointer();
                    break;
                }
                case '.': {
                    this.print()
                    break;
                }
                case ',': {
                    if (this.interpreterMode == InterpreterMode.INPUT_BEHIND_COMMA) {
                        ++i;
                        if (this.pointer < 0) {
                            this.negarray[-this.pointer] = charar[i].charCodeAt(0);
                        } else {
                            this.posarray[this.pointer] = charar[i].charCodeAt(0);
                        }
                    }
                    break;
                }
                case '[': {
                    if (this.pointer < 0) {
                        if (this.negarray[-this.pointer] == 0) {
                            i = this.findNextMatchingBracket(i);
                        } else {
                            brackets.push(i-1);
                        }
                    } else {
                        if (this.posarray[this.pointer] == 0) {
                            i = this.findNextMatchingBracket(i);
                        } else {
                            brackets.push(i-1);
                        }
                    }
                    break;
                }
                case ']': {
                    if (this.pointer < 0) {
                        if (this.negarray[-this.pointer] != 0) {
                            i = brackets.pop();
                        } else {
                            brackets.pop();
                        }
                    } else {
                        if (this.posarray[this.pointer] != 0) {
                            i = brackets.pop();
                        } else {
                            brackets.pop();
                        }
                    }
                }
            }
        }

    }

    inc() {
        if (this.pointer < 0) {
            ++this.negarray[-this.pointer];
        } else {
            ++this.posarray[this.pointer];
        }
    }

    dec() {
        if (this.pointer < 0) {
            --this.negarray[-this.pointer];
        } else {
            --this.posarray[this.pointer];
        }
    }

    decPointer() {
        --this.pointer;
        if(this.negarray.length < -this.pointer) {
            this.negarray.push(0);
        }
    }

    incPointer() {
        ++this.pointer;
        if(this.posarray.length <= this.pointer) {
            this.posarray.push(0);
        }
    }

    print() {
        if (this.pointer < 0) {
            this.endString += String.fromCharCode(this.negarray[-this.pointer]);
        } else {
            this.endString += String.fromCharCode(this.posarray[this.pointer]);
        }
    }

    findNextMatchingBracket(index:number) {
        let counter = 0
        for (let i = index; i < this.code.length; i++) {
            if (this.code[i] == "[") {
                ++counter;
            } else if(this.code[i] == "]") {
                --counter;
            }
            if(counter == 0) {
                return i;
            }
        }
        throw new SyntaxError("Brackets");
    }

    get() {
        return this.endString;
    }

}