-- Create function to increment eco coins
CREATE OR REPLACE FUNCTION public.increment_eco_coins(user_id UUID, amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET eco_coins = eco_coins + amount
  WHERE id = user_id;
END;
$$;