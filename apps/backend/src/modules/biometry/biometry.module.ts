import { Module } from '@nestjs/common';
import { BiometryService } from './biometry.service';

@Module({
    providers: [BiometryService],
    exports: [BiometryService],
})
export class BiometryModule { }
