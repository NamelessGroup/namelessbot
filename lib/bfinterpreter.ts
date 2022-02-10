import {CommandInteraction, MessageActionRow, MessageSelectMenu} from "discord.js";
import {destroy} from "../slashCommands/brainfuck";

export enum InterpreterMode {
    INPUT_BEHIND_COMMA,
    REQUEST_INPUT
}

export class BrainfuckInterpreter {
    posarray: number[] = new Array(1);
    negarray: number[] = new Array(0);
    pointer = 0;
    endString = "";

    readonly code: string[];
    iterator = 0;

    interpreterMode:InterpreterMode = InterpreterMode.INPUT_BEHIND_COMMA;
    interaction:CommandInteraction | undefined;
    id;

    nextChar: string;

    constructor(i: number, c: string, im?: InterpreterMode, ci?:CommandInteraction ) {
        this.id = i;
        this.code = c.split("");
        this.posarray[0] = 0
        if (im != undefined) {
            this.interpreterMode = im;
        }
        this.interaction = ci;

        this.checkCode();
    }

    checkCode() {
        if (this.interaction == undefined && this.interpreterMode == InterpreterMode.REQUEST_INPUT) {
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
        const brackets = new Array(0);
        let dontDestroy = false;
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
                    if (this.interpreterMode == InterpreterMode.INPUT_BEHIND_COMMA) {
                        ++this.iterator;
                        this.writeChar(this.code[this.iterator])
                    } else if (this.interpreterMode == InterpreterMode.REQUEST_INPUT) {
                        if (this.nextChar != undefined) {
                            this.writeChar(this.nextChar)
                            continue;
                        }
                        const row = new MessageActionRow().addComponents(new MessageSelectMenu().setCustomId("brainfuck"+this.id)
                            .addOptions([
                                {
                                    label: "A",
                                    description: "A",
                                    value: "A"
                                }
                            ]));
                        await this.interaction.followUp({content: this.endString == "" ? "Input is requested: " : this.endString, components:[row]})
                        dontDestroy = true;
                        break;
                    }
                }
                case '[': {
                    if (this.pointer < 0) {
                        if (this.negarray[-this.pointer] == 0) {
                            this.iterator = this.findNextMatchingBracket(this.iterator);
                        } else {
                            brackets.push(this.iterator-1);
                        }
                    } else {
                        if (this.posarray[this.pointer] == 0) {
                            this.iterator = this.findNextMatchingBracket(this.iterator);
                        } else {
                            brackets.push(this.iterator-1);
                        }
                    }
                    break;
                }
                case ']': {
                    if (this.pointer < 0) {
                        if (this.negarray[-this.pointer] != 0) {
                            this.iterator = brackets.pop();
                        } else {
                            brackets.pop();
                        }
                    } else {
                        if (this.posarray[this.pointer] != 0) {
                            this.iterator = brackets.pop();
                        } else {
                            brackets.pop();
                        }
                    }
                }
            }
            if (dontDestroy) {
                break;
            }
        }
        if (dontDestroy) return;
        destroy(this.id,this.interaction)

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

}