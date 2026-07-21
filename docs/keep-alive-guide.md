# How to Fix "Cold Starts" (The 6-Second Delay)

Since you are on the **Vercel Free Tier**, your server goes to sleep after 10-15 minutes of inactivity. The first person to visit afterwards has to wait ~5-10 seconds for it to wake up.

To fix this, you need to "ping" your website automatically every 10 minutes.

## Method A: Use a Free Uptime Monitor (Recommended)

1.  Go to a free service like **[UptimeRobot](https://uptimerobot.com/)** or **[Cron-Job.org](https://cron-job.org/en/)**.
2.  Create a new Monitor (or Cron Job).
3.  **URL**: `https://nvntory-mgm.vercel.app/` (Your deployed URL)
4.  **Interval**: **5 minutes** or **10 minutes**.
5.  **Save**.

**That's it!** This service will visit your site 24/7, keeping the Vercel server "warm" and ready for real users.

## Method B: GitHub Actions (For Developers)

If you don't want to use another service, you can add this file to your project:
`.github/workflows/keep-alive.yaml`

```yaml
name: Keep Alive
on:
  schedule:
    - cron: "*/10 * * * *" # Run every 10 minutes
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping URL
        run: curl -I https://nvntory-mgm.vercel.app/
```
