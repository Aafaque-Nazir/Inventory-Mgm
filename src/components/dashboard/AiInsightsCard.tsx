import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, AlertTriangle, TrendingDown } from 'lucide-react'
import { ForecastResult } from '@/lib/ai-forecast'
import { format } from 'date-fns'

interface AiInsightsCardProps {
    forecasts: ForecastResult[]
}

export function AiInsightsCard({ forecasts }: AiInsightsCardProps) {
    // Filter for "urgent" forecasts (e.g., running out in less than 7 days)
    const urgentForecasts = forecasts.filter(f =>
        f.daysUntilEmpty < 14 && f.velocity > 0 && f.confidence !== 'LOW'
    ).slice(0, 3) // Show top 3

    if (urgentForecasts.length === 0) return null

    return (
        <Card className="border-indigo-500/50 bg-indigo-50/10 dark:bg-indigo-950/10">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="h-5 w-5" />
                    <span>AI Insights</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {urgentForecasts.map((forecast) => (
                        <div key={forecast.itemId} className="flex items-start space-x-3 p-3 rounded-lg bg-background/50 border">
                            <div className="mt-1">
                                {forecast.daysUntilEmpty <= 3 ? (
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                ) : (
                                    <TrendingDown className="h-5 w-5 text-amber-500" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium">
                                    <span className="font-bold">{forecast.itemName}</span> is predicted to run out in <span className="font-bold text-foreground">{forecast.daysUntilEmpty} days</span>.
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Avg use: {forecast.velocity.toFixed(1)}/day • Est. Empty: {format(forecast.predictedDate, 'MMM dd')}
                                </p>
                            </div>
                        </div>
                    ))}
                    <p className="text-xs text-center text-muted-foreground pt-2">
                        Based on your last 30 days of sales history.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
