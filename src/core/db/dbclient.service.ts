import { Injectable } from '@nestjs/common';
import { getEntityManagerToken } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ModuleRef } from '@nestjs/core';


@Injectable()
export class DBClient {
    constructor(
        private moduleRef: ModuleRef,
    ) {}

    public async getEntityManager(namespace: string): Promise<EntityManager> {
        try {
            const entityManager = this.moduleRef.get<EntityManager>(getEntityManagerToken(`database-${namespace}`), { strict: false });
            if (!entityManager) {
                throw new Error(`EntityManager for namespace ${namespace} not found`);
            }
            return entityManager;
        } catch (error) {
            console.error(`Error getting EntityManager for namespace ${namespace}:`, error);
            throw new Error(`Error getting EntityManager for namespace ${namespace}`);
        }
    }
}
