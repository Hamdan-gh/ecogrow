import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scan, CheckCircle } from 'lucide-react';
import { ScanResult, Tree } from '@/lib/types';

interface ScanTreeProps {
  showNotification: (message: string, type?: 'success' | 'error') => void;
  onComplete: () => void;
}

export default function ScanTree({ showNotification, onComplete }: ScanTreeProps) {
  const [treeName, setTreeName] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        showNotification('Image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imagePreview) {
      showNotification('Please upload an image first!', 'error');
      return;
    }
    
    if (!treeName.trim()) {
      showNotification('Please enter a tree name!', 'error');
      return;
    }
    
    setLoading(true);
    setScanResult(null);
    
    try {
      // Simulated analysis
      const growthPoints = Math.floor(Math.random() * 25) + 15;
      const humidity = Math.floor(Math.random() * 40) + 40;
      const soilConditions = ['excellent', 'good', 'fair', 'poor'] as const;
      const soilCondition = soilConditions[Math.floor(Math.random() * 4)];
      
      let baseReward = 10;
      const bonuses: Array<{ name: string; amount: number }> = [];
      
      if (growthPoints > 30) {
        bonuses.push({ name: 'High Growth', amount: 5 });
        baseReward += 5;
      } else if (growthPoints > 20) {
        bonuses.push({ name: 'Good Growth', amount: 3 });
        baseReward += 3;
      }
      
      if (humidity > 65) {
        bonuses.push({ name: 'Optimal Humidity', amount: 5 });
        baseReward += 5;
      } else if (humidity > 50) {
        bonuses.push({ name: 'Good Humidity', amount: 3 });
        baseReward += 3;
      }
      
      if (soilCondition === 'excellent') {
        bonuses.push({ name: 'Excellent Soil', amount: 7 });
        baseReward += 7;
      } else if (soilCondition === 'good') {
        bonuses.push({ name: 'Good Soil', amount: 4 });
        baseReward += 4;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Insert tree
      const { data: newTree, error: treeError } = await supabase
        .from('trees')
        .insert({
          user_id: user.id,
          tree_name: treeName.trim(),
          growth_level: growthPoints,
          humidity,
          soil_condition: soilCondition,
          total_scans: 1
        })
        .select()
        .single();

      if (treeError) throw treeError;

      // Update user's eco coins
      const { error: profileError } = await supabase.rpc('increment_eco_coins', {
        user_id: user.id,
        amount: baseReward
      });

      if (profileError) {
        // Fallback: update manually
        const { data: profile } = await supabase
          .from('profiles')
          .select('eco_coins')
          .eq('id', user.id)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({ eco_coins: profile.eco_coins + baseReward })
            .eq('id', user.id);
        }
      }

      const result: ScanResult = {
        tree: newTree as Tree,
        reward: baseReward,
        bonuses,
        message: 'Tree analysis complete! 🌳',
        analysis: {
          growthQuality: growthPoints > 30 ? 'Excellent' : growthPoints > 20 ? 'Good' : 'Fair',
          humidityStatus: humidity > 65 ? 'Optimal' : humidity > 50 ? 'Good' : 'Needs Attention',
          soilQuality: soilCondition
        }
      };

      setScanResult(result);
      showNotification(result.message);
      
      setTimeout(() => {
        onComplete();
      }, 3000);
    } catch (error: any) {
      showNotification(error.message || 'Scan failed', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-card-hover">
        <CardHeader>
          <CardTitle className="text-3xl">Scan Tree</CardTitle>
        </CardHeader>
        <CardContent>
          {scanResult ? (
            <div className="text-center py-8 space-y-6">
              <div className="animate-bounce">
                <CheckCircle className="mx-auto text-success" size={80} />
              </div>
              
              <div className="bg-gradient-success text-success-foreground p-8 rounded-xl shadow-card-hover">
                <h3 className="text-3xl font-bold mb-3">{scanResult.message}</h3>
                <div className="text-7xl font-bold my-6">+{scanResult.reward} 🪙</div>
                <p className="text-xl opacity-90">EcoCoins Earned!</p>
                
                {scanResult.bonuses?.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-success-foreground/20">
                    <p className="text-lg mb-3 font-semibold">Reward Breakdown:</p>
                    <div className="space-y-2 text-left max-w-sm mx-auto">
                      <div className="flex justify-between bg-success-foreground/10 px-4 py-2 rounded">
                        <span>Base Reward:</span>
                        <span className="font-bold">+10 🪙</span>
                      </div>
                      {scanResult.bonuses.map((bonus, index) => (
                        <div key={index} className="flex justify-between bg-success-foreground/10 px-4 py-2 rounded">
                          <span>{bonus.name}:</span>
                          <span className="font-bold">+{bonus.amount} 🪙</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Card className="border-2 border-primary">
                <CardContent className="p-6">
                  <h4 className="text-2xl font-bold mb-4">🌳 Tree Analysis Report</h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Growth Level</p>
                      <p className="text-3xl font-bold text-primary">{scanResult.tree.growth_level}%</p>
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${scanResult.tree.growth_level}%` }}></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{scanResult.analysis?.growthQuality}</p>
                    </div>
                    
                    <div className="bg-secondary/10 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Humidity</p>
                      <p className="text-3xl font-bold text-secondary">{scanResult.tree.humidity}%</p>
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div className="bg-secondary h-2 rounded-full transition-all" style={{ width: `${scanResult.tree.humidity}%` }}></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{scanResult.analysis?.humidityStatus}</p>
                    </div>
                  </div>
                  
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Soil Condition</p>
                    <p className="text-2xl font-bold capitalize">{scanResult.tree.soil_condition}</p>
                  </div>
                </CardContent>
              </Card>
              
              <p className="text-muted-foreground text-sm">Redirecting to dashboard in 3 seconds...</p>
            </div>
          ) : (
            <form onSubmit={handleScan} className="space-y-6">
              <div>
                <Label htmlFor="treeName">Tree Name</Label>
                <Input
                  id="treeName"
                  type="text"
                  placeholder="Enter tree name (e.g., Oak Tree, Mango Tree)"
                  value={treeName}
                  onChange={(e) => setTreeName(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Tree Image</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center mt-2">
                  {imagePreview ? (
                    <div>
                      <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto mb-4 rounded" />
                      <Button 
                        type="button" 
                        onClick={() => setImagePreview(null)} 
                        variant="destructive"
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Scan className="mx-auto text-muted-foreground mb-4" size={48} />
                      <p className="text-muted-foreground mb-4">Click to upload tree image</p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                      <Button type="button" variant="default">
                        Choose File
                      </Button>
                    </label>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !imagePreview || !treeName.trim()}
                className="w-full py-6 text-lg"
                size="lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-foreground"></div>
                    Analyzing Tree Image...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Scan size={24} />
                    Scan Tree & Earn Rewards 🎁
                  </span>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
