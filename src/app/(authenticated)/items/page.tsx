import { createClient } from '@/lib/supabase/server'
import { ItemsTable } from '@/components/items/ItemsTable'
import { CreateItemDialog } from '@/components/items/CreateItemDialog'

export const dynamic = 'force-dynamic'

export default async function ItemsPage() {
    const supabase = await createClient()
    const { data: items } = await supabase.from('items').select('*').order('name')

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
                <CreateItemDialog />
            </div>
            <ItemsTable items={items || []} />
        </div>
    )
}
