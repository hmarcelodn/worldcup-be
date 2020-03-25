export interface IMatch {
    name: number;
    type: string;
    home_team: number;
    away_team: number;
    home_result?: any;
    away_result?: any;
    date: Date;
    stadium: number;
    finished: boolean;
    matchday: number;
    id: number;
}