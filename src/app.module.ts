import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JournalsModule } from './journals/journals.module';
import { LiwcModule } from './liwc/liwc.module';
import { User } from './users/entities/user.entity';
import { Journal } from './journals/entities/journal.entity';
import { LiwcWord } from './liwc/entities/liwc-word.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite', // Using file-based SQLite (change for production)
      entities: [User, Journal, LiwcWord], // Include all entities
      synchronize: true, // Auto-create tables (disable in production)
      logging: true, // Enable query logging for debugging
    }),
    AuthModule,
    UsersModule,
    JournalsModule,
    LiwcModule,
  ],
})
export class AppModule {}
