import { createWriteStream } from "fs";

export type LoggerOptions = {
    file?: string,
    stdout?: boolean,
}

export class Logger {

    private _fileLogger?: Console;

    constructor(private _options?: LoggerOptions) {
        if (this._options?.file) {
            const fileStream = createWriteStream(this._options.file);
            this._fileLogger = new console.Console(fileStream, fileStream);
        }
    }

    log(data: any) {
        if (this._options?.stdout !== false) {
            console.log(data)
        }
        this._fileLogger?.log(data);
    }
}