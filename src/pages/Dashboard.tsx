import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Award, TrendingUp, Trophy } from 'lucide-react';
import { Profile, Tree } from '@/lib/types';

interface DashboardProps {
  user: Profile;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

export default function Dashboard({ user, showNotification }: DashboardProps) {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [rank, setRank] = useState<{ rank: number; total_users: number } | null>(null);
  const [leaderboard, setLeaderboard] = useState<Profile[]>([]);

  useEffect(() => {
    loadTrees();
    loadRank();
    loadLeaderboard();
  }, []);

  const loadTrees = async () => {
    try {
      const { data, error } = await supabase
        .from('trees')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTrees((data || []) as Tree[]);
    } catch (error) {
      showNotification('Failed to load trees', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadRank = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_rank', { 
        user_id: user.id 
      });
      
      if (error) throw error;
      if (data && data.length > 0) {
        setRank(data[0]);
      }
    } catch (error) {
      console.error('Failed to load rank:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('eco_coins', { ascending: false })
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setLeaderboard((data || []) as Profile[]);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const avgGrowth = trees.length > 0 ? Math.round(trees.reduce((s, t) => s + t.growth_level, 0) / trees.length) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-primary text-primary-foreground rounded-xl p-8 shadow-card-hover">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome, {user?.full_name}!</h1>
            <p className="text-primary-foreground/90 text-lg">Keep growing and earning rewards 🌱</p>
          </div>
          {rank && (
            <div className="bg-background/10 backdrop-blur-sm rounded-lg px-6 py-4 text-center border border-primary-foreground/20">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="text-primary-foreground" size={20} />
                <p className="text-sm text-primary-foreground/80 font-medium">Your Rank</p>
              </div>
              <p className="text-3xl font-bold text-primary-foreground">
                #{rank.rank}
              </p>
              <p className="text-xs text-primary-foreground/70 mt-1">
                out of {rank.total_users} users
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="shadow-card hover:shadow-card-hover transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground">Total Trees</p>
              <Leaf className="text-primary" size={24} />
            </div>
            <p className="text-4xl font-bold text-primary">{trees.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card hover:shadow-card-hover transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground">EcoCoins</p>
              <Award className="text-accent" size={24} />
            </div>
            <p className="text-4xl font-bold text-accent">{user?.eco_coins || 0}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card hover:shadow-card-hover transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground">Avg Growth</p>
              <TrendingUp className="text-secondary" size={24} />
            </div>
            <p className="text-4xl font-bold text-secondary">{avgGrowth}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6">Your Trees</h2>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : trees.length === 0 ? (
              <div className="text-center py-12">
                <Leaf className="mx-auto text-muted mb-4" size={64} />
                <p className="text-muted-foreground text-lg">No trees yet. Scan one to get started!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {trees.map(tree => (
                  <Card key={tree.id} className="border-2">
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-3">{tree.tree_name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Growth:</span>
                          <span className="font-semibold text-primary">{tree.growth_level}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Humidity:</span>
                          <span className="font-semibold text-secondary">{tree.humidity}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Soil:</span>
                          <span className="font-semibold capitalize">{tree.soil_condition}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="text-accent" size={24} />
              <h2 className="text-2xl font-bold">Leaderboard</h2>
            </div>
            {leaderboard.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Loading leaderboard...</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {leaderboard.map((profile, index) => (
                  <div 
                    key={profile.id} 
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-colors ${
                      profile.id === user.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-card border-border hover:border-primary/50'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                      index === 0 ? 'bg-yellow-500 text-yellow-950' :
                      index === 1 ? 'bg-gray-400 text-gray-900' :
                      index === 2 ? 'bg-amber-600 text-amber-950' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {profile.full_name}
                        {profile.id === user.id && (
                          <span className="ml-2 text-xs text-primary">(You)</span>
                        )}
                      </p>
                      {profile.location && (
                        <p className="text-xs text-muted-foreground">{profile.location}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="text-accent" size={18} />
                      <span className="font-bold text-accent text-lg">{profile.eco_coins}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
