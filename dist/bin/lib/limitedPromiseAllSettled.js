// Default 30 second timeout for discovery tasks (can be overridden with env var)
const DISCOVERY_TIMEOUT = parseInt(process.env.MAGIC_TEST_DISCOVERY_TIMEOUT || '30000', 10);
export const limitedPromiseAllSettled = async (items, limit, fn) => {
    const results = [];
    const running = [];
    const processItem = async (item, index) => {
        let timer;
        try {
            // Configurable timeout per item to prevent indefinite hangs. The timer
            // must be cleared when the task settles early — otherwise leftover
            // timers pin the event loop for up to DISCOVERY_TIMEOUT after a
            // stalled run (see .plans/FIX_HANG.md, B2).
            const timeoutPromise = new Promise((_, reject) => {
                timer = setTimeout(() => reject(new Error(`Task timeout for: ${item}`)), DISCOVERY_TIMEOUT);
            });
            const value = await Promise.race([fn(item, index), timeoutPromise]);
            results[index] = { status: 'fulfilled', value: value };
        }
        catch (reason) {
            results[index] = { status: 'rejected', reason };
        }
        finally {
            if (timer) {
                clearTimeout(timer);
            }
        }
    };
    let index = 0;
    const consume = () => {
        while (running.length < limit && index < items.length) {
            const currentIndex = index++;
            const item = items[currentIndex];
            if (item) {
                const p = processItem(item, currentIndex).then(() => {
                    running.splice(running.indexOf(p), 1);
                    consume();
                });
                running.push(p);
            }
        }
    };
    consume();
    while (running.length > 0) {
        await Promise.race(running);
        consume();
    }
    return results;
};
//# sourceMappingURL=limitedPromiseAllSettled.js.map