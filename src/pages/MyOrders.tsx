import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { Order } from '@/lib/types';

interface MyOrdersProps {
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

export default function MyOrders({ showNotification }: MyOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders((data || []) as unknown as Order[]);
    } catch (error) {
      showNotification('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'pending': return 'secondary';
      case 'approved': return 'default';
      case 'on the way': return 'default';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch(status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'on the way': return '🚚';
      case 'delivered': return '📦';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-3xl">My Orders</CardTitle>
          <p className="text-muted-foreground">Track your delivery status</p>
        </CardHeader>
      </Card>

      {loading ? (
        <p className="text-center py-8">Loading orders...</p>
      ) : orders.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <ShoppingCart className="mx-auto text-muted mb-4" size={64} />
            <p className="text-muted-foreground text-lg">No orders yet</p>
            <p className="text-muted-foreground text-sm">Visit the marketplace to make your first purchase!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id} className="shadow-card hover:shadow-card-hover transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{order.item_name}</h3>
                    <p className="text-sm text-muted-foreground">Order ID: {order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      Placed on: {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-accent">{order.price} 🪙</p>
                    <Badge variant={getStatusVariant(order.status) as any} className="mt-2">
                      {getStatusEmoji(order.status)} {order.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Delivery Information:</h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <span className="ml-2 font-medium">{(order.delivery_info as any).fullName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="ml-2 font-medium">{(order.delivery_info as any).phone}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">WhatsApp:</span>
                      <span className="ml-2 font-medium">{(order.delivery_info as any).whatsapp}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">City:</span>
                      <span className="ml-2 font-medium">{(order.delivery_info as any).city}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-muted-foreground">Address:</span>
                      <span className="ml-2 font-medium">{(order.delivery_info as any).address}</span>
                    </div>
                    {(order.delivery_info as any).additionalNotes && (
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Notes:</span>
                        <span className="ml-2 font-medium">{(order.delivery_info as any).additionalNotes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
