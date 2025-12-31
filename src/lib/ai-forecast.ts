import { StockMovement, Item } from "@/types"
import { subDays, differenceInDays } from "date-fns"

export interface ForecastResult {
    itemId: string
    itemName: string
    currentStock: number
    velocity: number // avg items sold per day
    daysUntilEmpty: number
    predictedDate: Date
    confidence: 'HIGH' | 'MEDIUM' | 'LOW'
}

export function calculateForecasts(items: Item[], movements: StockMovement[]): ForecastResult[] {
    const DAYS_TO_ANALYZE = 30
    const cutoffDate = subDays(new Date(), DAYS_TO_ANALYZE)

    return items.map(item => {
        // 1. Filter movements for this item in the last 30 days (OUT only)
        const itemMovements = movements.filter(m =>
            m.item_id === item.id &&
            m.type === 'OUT' &&
            new Date(m.created_at) >= cutoffDate
        )

        // 2. Calculate Total Sold
        const totalSold = itemMovements.reduce((sum, m) => sum + Number(m.quantity), 0)

        // 3. Calculate Velocity (Avg Daily Consumption)
        // If totalSold is 0, velocity is 0. 
        // We divide by 30 days to get a smooth average.
        const velocity = totalSold / DAYS_TO_ANALYZE

        // 4. Calculate Days Until Empty
        let daysUntilEmpty = 999
        if (velocity > 0) {
            daysUntilEmpty = Math.floor(Number(item.current_stock) / velocity)
        }

        // 5. Determine Confidence
        // If we have very few data points (e.g., < 3 transactions), confidence is LOW
        const transactionCount = itemMovements.length
        let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH'
        if (transactionCount === 0) confidence = 'LOW'
        else if (transactionCount < 5) confidence = 'MEDIUM'

        // 6. Predict Date
        const predictedDate = new Date()
        predictedDate.setDate(predictedDate.getDate() + daysUntilEmpty)

        return {
            itemId: item.id,
            itemName: item.name,
            currentStock: Number(item.current_stock),
            velocity,
            daysUntilEmpty,
            predictedDate,
            confidence
        }
    }).sort((a, b) => a.daysUntilEmpty - b.daysUntilEmpty) // Sort by most urgent
}
