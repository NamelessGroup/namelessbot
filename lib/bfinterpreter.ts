class BrainfuckInterpreter {
    posarray: number[] = new Array(1);
    negarray: number[] = new Array(0);
    pointer: number = 0;
    endString: string;
    readonly code: string;

    constructor(c: string) {
        this.code = c
        this.posarray[0] = 0
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
        let brackkets = new Array(0);
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
                    break;
                }
                case '[': {
                    brackkets.push(i);
                    break;
                }
                case ']': {
                    i = brackkets.pop();
                    break;
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

}