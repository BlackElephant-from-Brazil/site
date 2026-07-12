'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { PricingPlanWithRefs, PricingPlanBenefit } from '@/types'

const ROUTE = '/dashboard/admin/site/planos'

export async function getPricingPlans(): Promise<PricingPlanWithRefs[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('pricing_plans')
    .select('*, project_type:project_types(*), benefits:pricing_plan_benefits(*)')
    .order('position', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map(plan => ({
    ...plan,
    benefits: (plan.benefits ?? []).sort((a: PricingPlanBenefit, b: PricingPlanBenefit) => a.position - b.position),
  })) as PricingPlanWithRefs[]
}

export async function createPricingPlan(payload: {
  name: string
  price: number
  project_type_id: string | null
  benefits: string[]
}): Promise<PricingPlanWithRefs> {
  const supabase = createAdminClient()
  const { count } = await supabase
    .from('pricing_plans')
    .select('*', { count: 'exact', head: true })
  const position = count ?? 0

  const { data, error } = await supabase
    .from('pricing_plans')
    .insert({ name: payload.name, price: payload.price, project_type_id: payload.project_type_id, position })
    .select('*, project_type:project_types(*)')
    .single()
  if (error) throw new Error(error.message)

  const benefitRows = payload.benefits.map((label, i) => ({
    pricing_plan_id: data.id,
    label,
    position: i,
  }))
  let benefits: PricingPlanBenefit[] = []
  if (benefitRows.length > 0) {
    const { data: benefitData, error: benefitError } = await supabase
      .from('pricing_plan_benefits')
      .insert(benefitRows)
      .select()
    if (benefitError) throw new Error(benefitError.message)
    benefits = (benefitData ?? []) as PricingPlanBenefit[]
  }

  revalidatePath(ROUTE)
  return { ...data, benefits } as PricingPlanWithRefs
}

export async function updatePricingPlan(
  id: string,
  payload: {
    name: string
    price: number
    project_type_id: string | null
    benefits: string[]
  }
): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('pricing_plans')
    .update({ name: payload.name, price: payload.price, project_type_id: payload.project_type_id })
    .eq('id', id)
  if (error) throw new Error(error.message)

  const { error: deleteError } = await supabase
    .from('pricing_plan_benefits')
    .delete()
    .eq('pricing_plan_id', id)
  if (deleteError) throw new Error(deleteError.message)

  const benefitRows = payload.benefits.map((label, i) => ({
    pricing_plan_id: id,
    label,
    position: i,
  }))
  if (benefitRows.length > 0) {
    const { error: insertError } = await supabase.from('pricing_plan_benefits').insert(benefitRows)
    if (insertError) throw new Error(insertError.message)
  }

  revalidatePath(ROUTE)
}

export async function deletePricingPlan(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('pricing_plans').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(ROUTE)
}

export async function reorderPricingPlans(items: { id: string; position: number }[]): Promise<void> {
  const supabase = createAdminClient()
  const results = await Promise.all(
    items.map(({ id, position }) =>
      supabase.from('pricing_plans').update({ position }).eq('id', id)
    )
  )
  const failed = results.find(r => r.error)
  if (failed?.error) throw new Error(failed.error.message)
  revalidatePath(ROUTE)
}
