export interface Istream {
  start(options?: any): Promise<void>
  stop(): Promise<void>
}
