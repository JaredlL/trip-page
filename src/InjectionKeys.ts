import type { InjectionKey } from 'vue'
import type { DateNow } from '@/types/Clock'

export const DateNowKey = Symbol() as InjectionKey<DateNow>
