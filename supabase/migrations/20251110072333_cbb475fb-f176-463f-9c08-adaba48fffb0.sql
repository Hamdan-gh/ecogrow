-- Allow all authenticated users to view basic profile information for leaderboard
CREATE POLICY "Users can view leaderboard data"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);