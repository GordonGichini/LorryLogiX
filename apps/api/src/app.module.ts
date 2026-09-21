import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { ContractsModule } from './contracts/contracts.module';
import { FuelModule } from './fuel/fuel.module';
import { MasterDataModule } from './master-data/master-data.module';
import { PrismaModule } from './prisma/prisma.module';
import { TripsModule } from './trips/trips.module';
@Module({ imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }), PrismaModule, HealthModule, MasterDataModule, ContractsModule, TripsModule, FuelModule] }) export class AppModule {}
