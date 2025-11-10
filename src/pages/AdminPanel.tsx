import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Order, Profile, MarketplaceItem } from '@/lib/types';

interface AdminPanelProps {
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

export default function AdminPanel({ showNotification }: AdminPanelProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Marketplace management state
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [newItem, setNewItem] = useState({ name: '', description: '', price_eco_coin: 0, stock: 0 });
  
  // User management state
  const [users, setUsers] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadOrders();
    loadMarketplaceItems();
    loadUsers();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false});
      
      if (error) throw error;
      setOrders((data || []) as unknown as Order[]);
    } catch (error) {
      showNotification('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      showNotification(`Order status updated to: ${newStatus}`);
      loadOrders();
    } catch (error) {
      showNotification('Failed to update status', 'error');
    }
  };

  const loadMarketplaceItems = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMarketplaceItems((data || []) as unknown as MarketplaceItem[]);
    } catch (error) {
      showNotification('Failed to load marketplace items', 'error');
    }
  };

  const createMarketplaceItem = async () => {
    if (!newItem.name || !newItem.description || newItem.price_eco_coin <= 0) {
      showNotification('Please fill all fields correctly', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('marketplace_items')
        .insert([newItem]);
      
      if (error) throw error;
      showNotification('Marketplace item created successfully');
      setNewItem({ name: '', description: '', price_eco_coin: 0, stock: 0 });
      loadMarketplaceItems();
    } catch (error) {
      showNotification('Failed to create marketplace item', 'error');
    }
  };

  const deleteMarketplaceItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      showNotification('Marketplace item deleted');
      loadMarketplaceItems();
    } catch (error) {
      showNotification('Failed to delete item', 'error');
    }
  };

  const loadUsers = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;
      setUsers((profilesData || []) as unknown as Profile[]);

      // Load user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'admin');
      
      if (rolesError) throw rolesError;
      
      const rolesMap: Record<string, boolean> = {};
      (rolesData || []).forEach((role: any) => {
        rolesMap[role.user_id] = true;
      });
      setUserRoles(rolesMap);
    } catch (error) {
      showNotification('Failed to load users', 'error');
    }
  };

  const toggleAdminRole = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      if (isCurrentlyAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
        
        if (error) throw error;
        showNotification('Admin role removed');
      } else {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert([{ user_id: userId, role: 'admin' }]);
        
        if (error) throw error;
        showNotification('Admin role granted');
      }
      loadUsers();
    } catch (error) {
      showNotification('Failed to update admin role', 'error');
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    approved: orders.filter(o => o.status === 'approved').length,
    'on the way': orders.filter(o => o.status === 'on the way').length,
    delivered: orders.filter(o => o.status === 'delivered').length
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-primary text-primary-foreground rounded-xl p-8 shadow-card-hover">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-primary-foreground/90">Manage orders, marketplace items, and users</p>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4 mt-6">

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Button
          onClick={() => setFilterStatus('all')}
          variant={filterStatus === 'all' ? 'default' : 'secondary'}
          className="h-auto py-4 flex flex-col"
        >
          <p className="text-2xl font-bold">{statusCounts.all}</p>
          <p className="text-sm">All Orders</p>
        </Button>
        <Button
          onClick={() => setFilterStatus('pending')}
          variant={filterStatus === 'pending' ? 'default' : 'secondary'}
          className="h-auto py-4 flex flex-col"
        >
          <p className="text-2xl font-bold">{statusCounts.pending}</p>
          <p className="text-sm">Pending</p>
        </Button>
        <Button
          onClick={() => setFilterStatus('approved')}
          variant={filterStatus === 'approved' ? 'default' : 'secondary'}
          className="h-auto py-4 flex flex-col"
        >
          <p className="text-2xl font-bold">{statusCounts.approved}</p>
          <p className="text-sm">Approved</p>
        </Button>
        <Button
          onClick={() => setFilterStatus('on the way')}
          variant={filterStatus === 'on the way' ? 'default' : 'secondary'}
          className="h-auto py-4 flex flex-col"
        >
          <p className="text-2xl font-bold">{statusCounts['on the way']}</p>
          <p className="text-sm">On the Way</p>
        </Button>
        <Button
          onClick={() => setFilterStatus('delivered')}
          variant={filterStatus === 'delivered' ? 'default' : 'secondary'}
          className="h-auto py-4 flex flex-col"
        >
          <p className="text-2xl font-bold">{statusCounts.delivered}</p>
          <p className="text-sm">Delivered</p>
        </Button>
      </div>

          {loading ? (
            <p className="text-center py-8">Loading orders...</p>
          ) : filteredOrders.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No orders found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <Card key={order.id} className="shadow-card">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{order.item_name}</h3>
                        <p className="text-sm text-muted-foreground">Order ID: {order.id}</p>
                        <p className="text-sm text-muted-foreground">Date: {new Date(order.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-accent">{order.price} 🪙</p>
                      </div>
                    </div>

                    <div className="bg-muted rounded-lg p-4 mb-4">
                      <h4 className="font-semibold mb-2">Delivery Details:</h4>
                      <div className="grid md:grid-cols-2 gap-2 text-sm">
                        <p><strong>Name:</strong> {(order.delivery_info as any).fullName}</p>
                        <p><strong>Phone:</strong> {(order.delivery_info as any).phone}</p>
                        <p><strong>WhatsApp:</strong> {(order.delivery_info as any).whatsapp}</p>
                        <p><strong>City:</strong> {(order.delivery_info as any).city}</p>
                        <p className="md:col-span-2"><strong>Address:</strong> {(order.delivery_info as any).address}</p>
                        {(order.delivery_info as any).additionalNotes && (
                          <p className="md:col-span-2"><strong>Notes:</strong> {(order.delivery_info as any).additionalNotes}</p>
                        )}
                      </div>
                    </div>

                    <Select value={order.status} onValueChange={(value) => updateStatus(order.id, value)}>
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="pending">⏳ Pending</SelectItem>
                        <SelectItem value="approved">✅ Approved</SelectItem>
                        <SelectItem value="on the way">🚚 On the Way</SelectItem>
                        <SelectItem value="delivered">📦 Delivered</SelectItem>
                        <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-6 mt-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Create New Marketplace Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Item Name</label>
                <Input
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g., Organic Seeds"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Describe the item..."
                  rows={3}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Price (Eco Coins)</label>
                  <Input
                    type="number"
                    value={newItem.price_eco_coin}
                    onChange={(e) => setNewItem({ ...newItem, price_eco_coin: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Stock</label>
                  <Input
                    type="number"
                    value={newItem.stock}
                    onChange={(e) => setNewItem({ ...newItem, stock: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>
              <Button onClick={createMarketplaceItem} className="w-full">
                Create Item
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">Existing Items</h3>
            {marketplaceItems.map(item => (
              <Card key={item.id} className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold">{item.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-accent font-semibold">{item.price_eco_coin} 🪙</span>
                        <span>Stock: {item.stock}</span>
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={() => deleteMarketplaceItem(item.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4 mt-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{user.full_name}</h4>
                      <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                      <p className="text-sm">Eco Coins: {user.eco_coins} 🪙</p>
                      {user.location && <p className="text-sm">Location: {user.location}</p>}
                    </div>
                    <Button
                      variant={userRoles[user.id] ? 'destructive' : 'default'}
                      onClick={() => toggleAdminRole(user.id, userRoles[user.id] || false)}
                    >
                      {userRoles[user.id] ? 'Remove Admin' : 'Make Admin'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
