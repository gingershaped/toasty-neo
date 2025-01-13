export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const { scheduledAntifreeze } = await import("@/lib/chat/antifreeze");
        const schedule = await import("node-schedule");
        schedule.scheduleJob("antifreeze", "0 0 * * *", scheduledAntifreeze);
    }
}