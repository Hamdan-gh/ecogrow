-- Create a function to get user rank based on eco_coins
CREATE OR REPLACE FUNCTION public.get_user_rank(user_id uuid)
RETURNS TABLE(rank bigint, total_users bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH user_ranks AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY eco_coins DESC, created_at ASC) as user_rank
    FROM public.profiles
  ),
  total_count AS (
    SELECT COUNT(*) as total FROM public.profiles
  )
  SELECT 
    COALESCE(ur.user_rank, 0)::bigint as rank,
    tc.total::bigint as total_users
  FROM total_count tc
  LEFT JOIN user_ranks ur ON ur.id = user_id;
END;
$$;