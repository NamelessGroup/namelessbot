import {CommandInteraction, ComponentType} from "discord.js";
import {destroy, incIndex} from "../slashCommands/brainfuck";

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
    iterator = 0;

    interpreterMode:InterpreterMode = InterpreterMode.INPUT_BEHIND_COMMA;
    interaction:CommandInteraction | undefined;
    id;
    inputRange;
    options = undefined;

    nextChar: string;

    brackets:number[];


    /**
     * Constructor for the brainfuck interpreter, program needs to be started with execute()
     *
     * @param i the id of the interpreter = pos in bfint-Array
     * @param c the code that should be executed
     * @param im optional interpreter mode, default is the INPUT_BEHIND_COMMA
     * @param ci optional CommandInteraction is required if the interpreter mode is REQUEST_INPUT
     * @param ir input range takes regex, that describes the possible input chars
     */
    constructor(i: number, c: string, im?: InterpreterMode, ci?:CommandInteraction, ir?:string) {
        this.id = i;
        this.code = c;
        this.posarray[0] = 0
        if (im != undefined) {
            this.interpreterMode = im;
        }
        this.interaction = ci;
        this.inputRange = ir
        this.checkCode();
        this.brackets = new Array(0)
    }

    /**
     * checks if the constructor params are correct, is automatically called by the constructor
     *
     * @throws SyntaxError if a param has errors
     */
    checkCode() {
        if (this.interaction == undefined && this.interpreterMode == InterpreterMode.REQUEST_INPUT
            && this.inputRange == undefined) {
            throw new SyntaxError("Error")
        }
        let counter = 0;
        for (let i = 0; i < this.code.length; i++) {
            if(this.code[i] == "[") {
                ++counter;
            } else if( this.code[i] == "]") {
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

    async execute() {
        for (this.iterator; this.iterator < this.code.length; this.iterator++) {
            switch (this.code[this.iterator]) {
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
                    console.log("input")
                    if (this.interpreterMode == InterpreterMode.INPUT_BEHIND_COMMA) {
                        this.iterator += 1;
                        this.writeChar(this.code[this.iterator])
                    } else if (this.interpreterMode == InterpreterMode.REQUEST_INPUT) {
                        if (this.nextChar != undefined) {
                            this.writeChar(this.nextChar);
                            this.nextChar = undefined;
                            continue;
                        }
                        if (this.options == undefined) this.buildOptions();
                        if (this.options == []) return;

                        await this.interaction.editReply({content: this.endString == "" ? "Input is requested: " : this.endString, components:[{
                            type: ComponentType.ActionRow,
                            components: [{
                                type: ComponentType.StringSelect,
                                customId: "brainfuck"+this.id+incIndex(),
                                options: this.options
                            }]
                        }]})
                        this.endString = "";
                        return;
                    }
                    break;
                }
                case '[': {
                    if (this.pointer < 0) {
                        if (this.negarray[-this.pointer] == 0) {
                            this.iterator = this.findNextMatchingBracket(this.iterator);
                        } else {
                            this.brackets.push(this.iterator-1);
                        }
                    } else {
                        if (this.posarray[this.pointer] == 0) {
                            this.iterator = this.findNextMatchingBracket(this.iterator);
                        } else {
                            this.brackets.push(this.iterator-1);
                        }
                    }
                    break;
                }
                case ']': {
                    if (this.pointer < 0) {
                        if (this.negarray[-this.pointer] != 0) {
                            this.iterator = this.brackets.pop();
                        } else {
                            this.brackets.pop();
                        }
                    } else {
                        if (this.posarray[this.pointer] != 0) {
                            this.iterator = this.brackets.pop();
                        } else {
                            this.brackets.pop();
                        }
                    }
                }
            }
        }
        destroy(this.id, this.interaction)

    }

    writeChar(c:string) {
        if (c.length != 1) {
            throw new SyntaxError("tomuchinput");
        }
        if (this.pointer < 0) {
            this.negarray[-this.pointer] = c.charCodeAt(0);
        } else {
            this.posarray[this.pointer] = c.charCodeAt(0);
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

    setNextChar(c: string) {
        if (c.length != 1) {
            throw new SyntaxError("tomuchinput");
        }
        this.nextChar = c;
    }

    buildOptions() {
        this.options = []
        const regex = new RegExp(this.inputRange);
        for (let i = 0; i < 128; ++i) {
            const c = String.fromCharCode(i)
            if (regex.test(c)) {
                this.options.push(
                    {
                        label: c,
                        description: c,
                        value: c,
                    }
                );
            }
        }
        if (this.options == []) throw new SyntaxError("Error");
    }

}