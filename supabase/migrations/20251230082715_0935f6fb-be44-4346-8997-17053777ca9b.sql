-- User assessments table (stores disability/circumstance choices)
CREATE TABLE public.user_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  has_disabilities BOOLEAN DEFAULT false,
  has_life_circumstances BOOLEAN DEFAULT false,
  disabilities TEXT[] DEFAULT '{}',
  symptoms TEXT[] DEFAULT '{}',
  circumstances TEXT[] DEFAULT '{}',
  circumstance_details TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User goals table (1 large, 2 medium, 4 mini)
CREATE TABLE public.user_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assessment_id UUID REFERENCES public.user_assessments(id),
  goal_size TEXT NOT NULL CHECK (goal_size IN ('large', 'medium', 'mini')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  progress INTEGER DEFAULT 0,
  aligned_safety_items TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User safety plans table
CREATE TABLE public.user_safety_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  calming_activity TEXT,
  trusted_person TEXT,
  safe_place TEXT,
  warning_signs TEXT[] DEFAULT '{}',
  coping_strategies TEXT[] DEFAULT '{}',
  emergency_contacts JSONB DEFAULT '[]',
  professional_resources JSONB DEFAULT '[]',
  reasons_to_live TEXT[] DEFAULT '{}',
  is_emergency_plan BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- SAI interaction memory (tracks patterns for adaptation)
CREATE TABLE public.sai_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  interaction_type TEXT NOT NULL,
  context TEXT,
  pattern_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- SAI user profile (adaptive behavior settings)
CREATE TABLE public.sai_user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  communication_style TEXT DEFAULT 'gentle',
  pacing_preference TEXT DEFAULT 'slow',
  sensitivity_flags JSONB DEFAULT '{}',
  interaction_count INTEGER DEFAULT 0,
  last_mood TEXT,
  adaptation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_safety_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sai_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sai_user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_assessments
CREATE POLICY "Users can view their own assessments" ON public.user_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own assessments" ON public.user_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own assessments" ON public.user_assessments FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_goals
CREATE POLICY "Users can view their own goals" ON public.user_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own goals" ON public.user_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.user_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.user_goals FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_safety_plans
CREATE POLICY "Users can view their own safety plans" ON public.user_safety_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own safety plans" ON public.user_safety_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own safety plans" ON public.user_safety_plans FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for sai_memory
CREATE POLICY "Users can view their own SAI memory" ON public.sai_memory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own SAI memory" ON public.sai_memory FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for sai_user_profiles
CREATE POLICY "Users can view their own SAI profile" ON public.sai_user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own SAI profile" ON public.sai_user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own SAI profile" ON public.sai_user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Update timestamp triggers
CREATE TRIGGER update_user_assessments_updated_at BEFORE UPDATE ON public.user_assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_goals_updated_at BEFORE UPDATE ON public.user_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_safety_plans_updated_at BEFORE UPDATE ON public.user_safety_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sai_user_profiles_updated_at BEFORE UPDATE ON public.sai_user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();