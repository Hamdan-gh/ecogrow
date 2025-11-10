import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingCart, Award, X } from 'lucide-react';
import { Profile, MarketplaceItem, DeliveryInfo } from '@/lib/types';

interface MarketplaceProps {
  user: Profile;
  showNotification: (message: string, type?: 'success' | 'error') => void;
  onPurchase: () => void;
}

export default function Marketplace({ user, showNotification, onPurchase }: MarketplaceProps) {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    fullName: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: '',
    additionalNotes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const { data, error } = await supabase
      .from('marketplace_items')
      .select('*')
      .order('name');
    
    if (error) {
      showNotification('Failed to load items', 'error');
    } else {
      setItems((data || []) as MarketplaceItem[]);
    }
  };

  const handleBuyClick = (item: MarketplaceItem) => {
    if (user.eco_coins < item.price_eco_coin) {
      showNotification('Insufficient EcoCoins', 'error');
      return;
    }
    setSelectedItem(item);
    setShowOrderForm(true);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    setSubmitting(true);
    
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      // Check if user has enough coins
      if (user.eco_coins < selectedItem.price_eco_coin) {
        throw new Error('Insufficient EcoCoins');
      }

      // Create order
      const { error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: authUser.id,
          item_id: selectedItem.id,
          item_name: selectedItem.name,
          price: selectedItem.price_eco_coin,
          delivery_info: deliveryInfo as any,
          status: 'pending'
        }]);

      if (orderError) throw orderError;

      // Deduct coins from profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ eco_coins: user.eco_coins - selectedItem.price_eco_coin })
        .eq('id', authUser.id);

      if (profileError) throw profileError;

      // Update item stock
      const { error: stockError } = await supabase
        .from('marketplace_items')
        .update({ stock: selectedItem.stock - 1 })
        .eq('id', selectedItem.id);

      if (stockError) throw stockError;

      showNotification('Order placed successfully! Check "My Orders" for tracking.');
      loadItems();
      onPurchase();
      setShowOrderForm(false);
      setSelectedItem(null);
      setDeliveryInfo({
        fullName: '',
        phone: '',
        whatsapp: '',
        address: '',
        city: '',
        additionalNotes: ''
      });
    } catch (error: any) {
      showNotification(error.message || 'Failed to place order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {showOrderForm && selectedItem ? (
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-card-hover">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-3xl">Complete Your Order</CardTitle>
                <Button onClick={() => setShowOrderForm(false)} variant="ghost" size="icon">
                  <X size={24} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-4">
                  <ShoppingCart className="text-primary" size={48} />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{selectedItem.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-accent">{selectedItem.price_eco_coin} 🪙</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <h3 className="font-bold text-lg mb-4">Delivery Information</h3>
                
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={deliveryInfo.fullName}
                    onChange={(e) => setDeliveryInfo({...deliveryInfo, fullName: e.target.value})}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={deliveryInfo.phone}
                      onChange={(e) => setDeliveryInfo({...deliveryInfo, phone: e.target.value})}
                      placeholder="+233 XX XXX XXXX"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      value={deliveryInfo.whatsapp}
                      onChange={(e) => setDeliveryInfo({...deliveryInfo, whatsapp: e.target.value})}
                      placeholder="+233 XX XXX XXXX"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Textarea
                    id="address"
                    value={deliveryInfo.address}
                    onChange={(e) => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
                    placeholder="Enter your complete delivery address"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="city">City/Town *</Label>
                  <Input
                    id="city"
                    type="text"
                    value={deliveryInfo.city}
                    onChange={(e) => setDeliveryInfo({...deliveryInfo, city: e.target.value})}
                    placeholder="e.g., Accra, Kumasi"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={deliveryInfo.additionalNotes}
                    onChange={(e) => setDeliveryInfo({...deliveryInfo, additionalNotes: e.target.value})}
                    placeholder="Any special delivery instructions"
                    rows={2}
                  />
                </div>

                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                  <p className="text-sm">
                    <strong>📦 Delivery Process:</strong> Your order will be reviewed by our admin team. You'll be notified via WhatsApp about the delivery status.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() => setShowOrderForm(false)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? 'Processing...' : `Place Order (${selectedItem.price_eco_coin} 🪙)`}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <Card className="shadow-card">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold mb-1">Marketplace</h2>
                <p className="text-muted-foreground">Redeem your EcoCoins for farming supplies</p>
              </div>
              <div className="bg-accent px-6 py-3 rounded-lg">
                <p className="text-sm text-accent-foreground/70">Balance</p>
                <p className="text-2xl font-bold text-accent-foreground flex items-center gap-2">
                  <Award size={24} />
                  {user?.eco_coins || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            {items.map(item => (
              <Card key={item.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-primary/10 h-40 rounded-lg mb-4 flex items-center justify-center">
                    <ShoppingCart className="text-primary" size={48} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4 h-12 overflow-hidden">{item.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-bold text-accent">{item.price_eco_coin} 🪙</span>
                    <span className="text-xs text-muted-foreground">Stock: {item.stock}</span>
                  </div>
                  <Button
                    onClick={() => handleBuyClick(item)}
                    disabled={user.eco_coins < item.price_eco_coin || item.stock === 0}
                    className="w-full"
                  >
                    {item.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
