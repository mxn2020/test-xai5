import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession, signOut } from '../../lib/auth-client';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { LogOut, User, Mail, Calendar, Shield, Home, Plus, Edit, Trash } from 'lucide-react';
import { Container } from '../../lib/dev-container';

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
};

export const Dashboard: React.FC = () => {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Omit<Client, 'id'>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      setClients(prev => prev.map(c => c.id === editingClient.id ? { ...c, ...formData } : c));
      setEditingClient(null);
    } else {
      const newClient = { ...formData, id: Date.now().toString() };
      setClients(prev => [...prev, newClient]);
    }
    setFormData({ name: '', email: '', phone: '', address: '', notes: '' });
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData(client);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  if (isPending) {
    return (
      <Container componentId="dashboard-loading">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (!session) {
    return (
      <Container componentId="dashboard-unauthorized">
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                <p className="text-muted-foreground mb-4">
                  Please log in to access your dashboard.
                </p>
                <Button onClick={() => navigate('/login')} className="w-full">
                  Go to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  const user = session.user;

  return (
    <Container componentId="dashboard-page">
      <div className="min-h-screen bg-gray-50">
        <Container componentId="dashboard-header">
          <div className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Dashboard
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Back to Home
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>

        <Container componentId="dashboard-content">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Container componentId="user-profile-card">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                        <AvatarFallback className="text-lg">
                          {getUserInitials(user.name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Email</span>
                        </div>
                        <Badge variant={user.emailVerified ? "default" : "secondary"}>
                          {user.emailVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Member since</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Container>

              <Container componentId="client-management">
                <div className="md:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Manage Your Clients</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                        </div>
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input id="address" name="address" value={formData.address} onChange={handleInputChange} />
                        </div>
                        <div>
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} />
                        </div>
                        <Button type="submit" className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          {editingClient ? 'Update Client' : 'Add Client'}
                        </Button>
                      </form>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clients.map(client => (
                            <TableRow key={client.id}>
                              <TableCell>{client.name}</TableCell>
                              <TableCell>{client.email}</TableCell>
                              <TableCell>{client.phone}</TableCell>
                              <TableCell>
                                <Button variant="ghost" onClick={() => handleEdit(client)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" onClick={() => handleDelete(client.id)}>
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {clients.length === 0 && (
                        <p className="text-center text-muted-foreground mt-4">No clients added yet.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </Container>
            </div>
          </div>
        </Container>
      </div>
    </Container>
  );
};