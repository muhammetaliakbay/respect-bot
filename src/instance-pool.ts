export class InstancePool<T> {
    private pool: T[] = []
    private count = 0
    constructor(
        readonly limit: number,
        readonly generator: (index: number) => T | Promise<T>,
    ) {
    }

    async pop(): Promise<T | undefined> {
        if (this.pool.length > 0) {
            const [instance] = this.pool.splice(0, 1)
            return instance
        } else if (this.count < this.limit) {
            const instance = await this.generator(this.count ++)
            return instance
        } else {
            return undefined
        }
    }
    
    push(instance: T) {
        if (!this.pool.includes(instance)) {
            this.pool.push(instance)
        }
    }
}
