import Observer, { Emitter, EventType as EventKey } from 'mitt'
export { Observer }
export const observer = Observer()
export enum EventName {
    COMMON_CODEX_REPEAT = 'COMMON_CODEX_REPEAT'
}

export type EventType<T extends Record<EventKey, Omix> = Omix> = Emitter<T>
