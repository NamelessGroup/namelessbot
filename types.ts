export interface IChatCommandList {
    [key: string]: IChatCommandHandler
}

export interface IChatCommandHandler {
    handler: Function
}
