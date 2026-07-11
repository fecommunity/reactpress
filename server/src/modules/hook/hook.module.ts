import { Global, Module } from '@nestjs/common';

import { HookService } from './hook.service';

@Global()
@Module({
  providers: [HookService],
  exports: [HookService],
})
export class HookModule {}
