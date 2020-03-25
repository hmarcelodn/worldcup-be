import { Group } from "../Group";

export interface IGroupRepository{
    getGroups(): Promise<Array<Group>>;
}