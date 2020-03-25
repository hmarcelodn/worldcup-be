// TypeORM
import { Service } from "typedi";
import { EntityRepository, Repository } from "typeorm";

// Local Deps
import { Stadium } from "../entity/Stadium";

@Service()
@EntityRepository(Stadium)
export class StadiumRepository extends Repository<Stadium>{

}