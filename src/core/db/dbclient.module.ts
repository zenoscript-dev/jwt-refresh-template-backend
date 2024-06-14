import { Module } from '@nestjs/common';

import { DBClient } from './dbclient.service';

@Module({
  imports: [],
  providers: [DBClient],
  exports: [DBClient],
})
export class DBClientModule {}