import { IMatch } from "./IMatch";

export interface IGroup {
    name: string;
    winner?: any;
    runnerup?: any;
    matches: IMatch[];
}