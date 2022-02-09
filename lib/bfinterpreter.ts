enum InterpreterMode {
    InputBehindComma,
    RequestInput
}

class BrainfuckInterpreter {
    posarray: number[] = new Array(1);
    negarray: number[] = new Array(0);
    pointer: number = 0;
    endString: string;
    readonly code: string;
    interpreterMode:InterpreterMode = InterpreterMode.InputBehindComma;

    constructor(c: string, im?: InterpreterMode) {
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
        let counter:number = 0;
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
        let brackets = new Array(0);
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
                    if (this.interpreterMode == InterpreterMode.InputBehindComma) {
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
                            i = this.findNextMatchingBracket(charar, i);
                        } else {
                            brackets.push(i);
                        }
                    } else {
                        if (this.posarray[this.pointer] == 0) {
                            i = this.findNextMatchingBracket(charar, i);
                        } else {
                            brackets.push(i);
                        }
                    }
                    break;
                }
                case ']': {
                    if (this.pointer < 0) {
                        if (this.negarray[-this.pointer] == 0) {
                            i = brackets.pop();
                        } else {
                            brackets.pop();
                        }
                    } else {
                        if (this.posarray[this.pointer] == 0) {
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

    findNextMatchingBracket(array:string[], index:number) {
        let counter:number = 0
        for (let i = index; i < array.length; i++) {
            if (array[i] == "[") {
                ++counter;
            } else if(array[i] == "]") {
                --counter;
            }
            if(counter == 0) {
                return i;
            }
        }
        throw new SyntaxError("Brackets");
    }

}