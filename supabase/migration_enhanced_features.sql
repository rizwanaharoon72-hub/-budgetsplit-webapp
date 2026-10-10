-- ============================================================
-- BudgetSplit — Migration: Phase 2 Enhanced Features
-- Run this in the Supabase SQL Editor AFTER initial schema.sql
-- ============================================================

-- ==========================
-- 1. Add budget ratio columns to profiles
-- ==========================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS needs_ratio  numeric(5,2) NOT NULL DEFAULT 50.00,
  ADD COLUMN IF NOT EXISTS wants_ratio  numeric(5,2) NOT NULL DEFAULT 30.00,
  ADD COLUMN IF NOT EXISTS savings_ratio numeric(5,2) NOT NULL DEFAULT 20.00;

-- Soft constraint: ratios should sum to 100 (add manually if desired)
-- ALTER TABLE public.profiles ADD CONSTRAINT chk_ratios_sum CHECK (needs_ratio + wants_ratio + savings_ratio = 100);

-- ==========================
-- 2. Create recurring_expenses table
-- ==========================
CREATE TABLE IF NOT EXISTS public.recurring_expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    amount numeric(12,2) NOT NULL CHECK (amount > 0),
    category text NOT NULL CHECK (category IN ('needs', 'wants', 'savings')),
    start_date date NOT NULL DEFAULT CURRENT_DATE,
    frequency text NOT NULL DEFAULT 'monthly',
    end_date date,
    is_active boolean NOT NULL DEFAULT true,
    last_generated_month text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ==========================
-- 3. Add recurring_id link column to expenses
-- ==========================
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS recurring_id uuid REFERENCES public.recurring_expenses(id) ON DELETE SET NULL;

-- ==========================
-- 4. Indexes
-- ==========================
CREATE INDEX IF NOT EXISTS idx_recurring_user_id ON public.recurring_expenses(user_id);

-- ==========================
-- 5. Trigger for recurring_expenses.updated_at
-- ==========================
DROP TRIGGER IF EXISTS trg_recurring_expenses_updated_at ON public.recurring_expenses;
CREATE TRIGGER trg_recurring_expenses_updated_at
  BEFORE UPDATE ON public.recurring_expenses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==========================
-- 6. RLS: Enable and configure for recurring_expenses
-- ==========================
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own recurring_expenses" ON public.recurring_expenses;
CREATE POLICY "Users can read own recurring_expenses"
ON public.recurring_expenses FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recurring_expenses" ON public.recurring_expenses;
CREATE POLICY "Users can insert own recurring_expenses"
ON public.recurring_expenses FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recurring_expenses" ON public.recurring_expenses;
CREATE POLICY "Users can update own recurring_expenses"
ON public.recurring_expenses FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own recurring_expenses" ON public.recurring_expenses;
CREATE POLICY "Users can delete own recurring_expenses"
ON public.recurring_expenses FOR DELETE
USING (auth.uid() = user_id);
