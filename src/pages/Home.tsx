import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="text-center max-w-3xl">
        <div className="inline-block p-6 bg-primary/10 rounded-full mb-8 animate-bounce">
          <Leaf className="text-primary" size={80} />
        </div>
        <h1 className="text-6xl font-bold text-foreground mb-6 leading-tight">
          Welcome to <span className="text-primary">EcoGrow</span>
        </h1>
        <p className="text-2xl text-muted-foreground mb-12 leading-relaxed">
          Plant trees, earn rewards, save the planet! 🌍
        </p>
        <Button onClick={() => onNavigate('login')} size="lg" className="text-lg px-12 py-6 h-auto">
          Get Started
        </Button>
        
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-card p-6 rounded-xl shadow-card">
            <div className="text-4xl mb-4">🌳</div>
            <h3 className="text-xl font-bold mb-2">Scan Trees</h3>
            <p className="text-muted-foreground">Upload tree photos and get detailed analysis</p>
          </div>
          <div className="bg-card p-6 rounded-xl shadow-card">
            <div className="text-4xl mb-4">🪙</div>
            <h3 className="text-xl font-bold mb-2">Earn Rewards</h3>
            <p className="text-muted-foreground">Get EcoCoins for every tree you scan</p>
          </div>
          <div className="bg-card p-6 rounded-xl shadow-card">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="text-xl font-bold mb-2">Shop Green</h3>
            <p className="text-muted-foreground">Redeem coins for eco-friendly products</p>
          </div>
        </div>
      </div>
    </div>
  );
}
