import { useEffect, useMemo, useState } from 'react';
import { addDays, format } from 'date-fns';
import { Loader2, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api';
import {
  AdminStats,
  AdminSubscription,
  AdminTransaction,
  AdminUserSummary,
  Prono,
  PronoResult,
  PronoStatus,
} from '@/types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

const formatDate = (value: string) => format(new Date(value), 'dd MMM yyyy HH:mm');

const toDateInputValue = (value: Date) => format(value, "yyyy-MM-dd'T'HH:mm");

const initialPronoForm = () => ({
  title: '',
  sport: '',
  competition: '',
  matchTime: toDateInputValue(new Date()),
  tip: '',
  odd: 1.8,
  confidence: 60,
  content: '',
  status: 'draft' as PronoStatus,
});

const initialSubscriptionForm = () => {
  const now = new Date();
  return {
    userId: '',
    plan: 'premium',
    status: 'active',
    currentPeriodStart: toDateInputValue(now),
    currentPeriodEnd: toDateInputValue(addDays(now, 30)),
  };
};

export default function Admin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [pronos, setPronos] = useState<Prono[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingProno, setSavingProno] = useState(false);
  const [savingSubscription, setSavingSubscription] = useState(false);

  const [pronoForm, setPronoForm] = useState(initialPronoForm);
  const [subscriptionForm, setSubscriptionForm] = useState(initialSubscriptionForm);

  const loadPronos = async () => {
    const [today, yesterday, beforeYesterday] = await Promise.all([
      apiClient.get('/pronos/today'),
      apiClient.get('/pronos/yesterday'),
      apiClient.get('/pronos/before-yesterday'),
    ]);

    const pool = [...(today.pronos ?? []), ...(yesterday.pronos ?? []), ...(beforeYesterday.pronos ?? [])];
    const unique = new Map<string, Prono>();
    pool.forEach((item: Prono) => {
      unique.set(item.id, item);
    });
    const ordered = Array.from(unique.values()).sort(
      (a, b) => new Date(b.matchTime).getTime() - new Date(a.matchTime).getTime(),
    );
    setPronos(ordered);
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, subsData, txData] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/users'),
        apiClient.get('/admin/subscriptions'),
        apiClient.get('/admin/transactions'),
      ]);

      setStats(statsData);
      setUsers(usersData.users ?? []);
      setSubscriptions(subsData.subscriptions ?? []);
      setTransactions(txData.transactions ?? []);

      await loadPronos();
    } catch (error) {
      const message = (error as Error).message ?? 'Impossible de récupérer les données admin';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateProno = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingProno(true);
    try {
      await apiClient.post('/pronos', {
        ...pronoForm,
        matchTime: new Date(pronoForm.matchTime).toISOString(),
        odd: Number(pronoForm.odd),
        confidence: Number(pronoForm.confidence),
      });
      toast.success('Prono créé avec succès');
      setPronoForm(initialPronoForm());
      await loadPronos();
    } catch (error) {
      toast.error((error as Error).message ?? 'Impossible de créer le prono');
    } finally {
      setSavingProno(false);
    }
  };

  const handleUpdateProno = async (id: string, updates: Partial<{ status: PronoStatus; result: PronoResult }>) => {
    try {
      await apiClient.put(`/pronos/${id}`, updates);
      toast.success('Prono mis à jour');
      await loadPronos();
    } catch (error) {
      toast.error((error as Error).message ?? 'Impossible de mettre à jour le prono');
    }
  };

  const handleDeleteProno = async (id: string) => {
    if (!confirm('Supprimer ce prono ?')) return;
    try {
      await apiClient.delete(`/pronos/${id}`);
      toast.success('Prono supprimé');
      await loadPronos();
    } catch (error) {
      toast.error((error as Error).message ?? 'Suppression impossible');
    }
  };

  const handleCreateSubscription = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingSubscription(true);
    try {
      await apiClient.post('/admin/subscriptions', {
        ...subscriptionForm,
        currentPeriodStart: new Date(subscriptionForm.currentPeriodStart).toISOString(),
        currentPeriodEnd: new Date(subscriptionForm.currentPeriodEnd).toISOString(),
      });
      toast.success('Abonnement créé');
      setSubscriptionForm(initialSubscriptionForm());
      const subs = await apiClient.get('/admin/subscriptions');
      setSubscriptions(subs.subscriptions ?? []);
    } catch (error) {
      toast.error((error as Error).message ?? 'Impossible de créer l’abonnement');
    } finally {
      setSavingSubscription(false);
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!confirm('Supprimer cet abonnement ?')) return;
    try {
      await apiClient.delete(`/admin/subscriptions/${id}`);
      toast.success('Abonnement supprimé');
      const subs = await apiClient.get('/admin/subscriptions');
      setSubscriptions(subs.subscriptions ?? []);
    } catch (error) {
      toast.error((error as Error).message ?? 'Suppression impossible');
    }
  };

  const handleExtendSubscription = async (id: string, days = 30) => {
    const subscription = subscriptions.find((sub) => sub.id === id);
    if (!subscription) {
      toast.error('Abonnement introuvable');
      return;
    }
    const newEnd = addDays(new Date(subscription.currentPeriodEnd), days);
    try {
      await apiClient.put(`/admin/subscriptions/${id}`, {
        currentPeriodEnd: newEnd.toISOString(),
      });
      toast.success(`Abonnement prolongé de ${days} jours`);
      const subs = await apiClient.get('/admin/subscriptions');
      setSubscriptions(subs.subscriptions ?? []);
    } catch (error) {
      toast.error((error as Error).message ?? 'Impossible de prolonger');
    }
  };

  const latestTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-cyan to-neon-green bg-clip-text text-transparent">
              Panneau d’administration
            </h1>
            <p className="text-muted-foreground">Gérez vos pronostics, abonnements et utilisateurs.</p>
          </div>
          <Button variant="outline" onClick={loadAdminData} className="w-full sm:w-auto">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Rafraîchir
          </Button>
        </div>

        {stats && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Statistiques globales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Utilisateurs" value={stats.totalUsers} />
                <StatCard label="Abonnements actifs" value={stats.activeSubscriptions} />
                <StatCard label="Revenus" value={formatCurrency(stats.totalRevenue)} />
                <StatCard label="Commissions payées" value={formatCurrency(stats.totalCommissions)} />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Créer un prono</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreateProno}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Titre</Label>
                    <Input
                      required
                      value={pronoForm.title}
                      onChange={(event) => setPronoForm((prev) => ({ ...prev, title: event.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Sport</Label>
                    <Input
                      required
                      value={pronoForm.sport}
                      onChange={(event) => setPronoForm((prev) => ({ ...prev, sport: event.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Compétition</Label>
                    <Input
                      required
                      value={pronoForm.competition}
                      onChange={(event) =>
                        setPronoForm((prev) => ({ ...prev, competition: event.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Match</Label>
                    <Input
                      type="datetime-local"
                      required
                      value={pronoForm.matchTime}
                      onChange={(event) =>
                        setPronoForm((prev) => ({ ...prev, matchTime: event.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Tip</Label>
                    <Input
                      required
                      value={pronoForm.tip}
                      onChange={(event) => setPronoForm((prev) => ({ ...prev, tip: event.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Cote</Label>
                      <Input
                        type="number"
                        min="1"
                        step="0.01"
                        required
                        value={pronoForm.odd}
                        onChange={(event) => setPronoForm((prev) => ({ ...prev, odd: Number(event.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label>Confiance (%)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={pronoForm.confidence}
                        onChange={(event) =>
                          setPronoForm((prev) => ({ ...prev, confidence: Number(event.target.value) }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Statut</Label>
                    <Select
                      value={pronoForm.status}
                      onValueChange={(value) =>
                        setPronoForm((prev) => ({ ...prev, status: value as PronoStatus }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="published">Publié</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Analyse</Label>
                  <Textarea
                    rows={4}
                    required
                    value={pronoForm.content}
                    onChange={(event) => setPronoForm((prev) => ({ ...prev, content: event.target.value }))}
                  />
                </div>
                <Button type="submit" disabled={savingProno} className="w-full sm:w-auto">
                  {savingProno ? 'Création...' : 'Publier le prono'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Pronos récents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pronos.length === 0 ? (
                <p className="text-muted-foreground text-sm">Aucun prono disponible.</p>
              ) : (
                <div className="space-y-3 max-h-[540px] overflow-y-auto pr-2">
                  {pronos.map((prono) => (
                    <div key={prono.id} className="border rounded-lg p-4 space-y-3 bg-background/50">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold">{prono.title}</p>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            {prono.sport} · {prono.competition}
                          </p>
                        </div>
                        <Badge variant={prono.status === 'published' ? 'default' : 'secondary'}>
                          {prono.status === 'published' ? 'Publié' : 'Brouillon'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{formatDate(prono.matchTime)}</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <Label>Statut</Label>
                          <Select
                            value={prono.status}
                            onValueChange={(value) =>
                              handleUpdateProno(prono.id, { status: value as PronoStatus })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Brouillon</SelectItem>
                              <SelectItem value="published">Publié</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Résultat</Label>
                          <Select
                            value={prono.result}
                            onValueChange={(value) =>
                              handleUpdateProno(prono.id, { result: value as PronoResult })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Résultat" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">En attente</SelectItem>
                              <SelectItem value="won">Gagné</SelectItem>
                              <SelectItem value="lost">Perdu</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Tip: <strong>{prono.tip}</strong> · Cote {prono.odd}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteProno(prono.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Créer / prolonger un abonnement</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreateSubscription}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>ID utilisateur</Label>
                    <Input
                      required
                      value={subscriptionForm.userId}
                      onChange={(event) =>
                        setSubscriptionForm((prev) => ({ ...prev, userId: event.target.value }))
                      }
                      placeholder="UUID Prisma"
                    />
                  </div>
                  <div>
                    <Label>Plan</Label>
                    <Input
                      required
                      value={subscriptionForm.plan}
                      onChange={(event) =>
                        setSubscriptionForm((prev) => ({ ...prev, plan: event.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Statut</Label>
                    <Select
                      value={subscriptionForm.status}
                      onValueChange={(value) =>
                        setSubscriptionForm((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="paused">En pause</SelectItem>
                        <SelectItem value="canceled">Annulé</SelectItem>
                        <SelectItem value="expired">Expiré</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Début</Label>
                    <Input
                      type="datetime-local"
                      required
                      value={subscriptionForm.currentPeriodStart}
                      onChange={(event) =>
                        setSubscriptionForm((prev) => ({ ...prev, currentPeriodStart: event.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Fin</Label>
                    <Input
                      type="datetime-local"
                      required
                      value={subscriptionForm.currentPeriodEnd}
                      onChange={(event) =>
                        setSubscriptionForm((prev) => ({ ...prev, currentPeriodEnd: event.target.value }))
                      }
                    />
                  </div>
                </div>
                <Button type="submit" disabled={savingSubscription} className="w-full sm:w-auto">
                  {savingSubscription ? 'Enregistrement...' : 'Valider'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex items-center justify-between space-y-0">
              <CardTitle>Abonnements</CardTitle>
              <Badge variant="outline">{subscriptions.length}</Badge>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {subscriptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun abonnement pour le moment.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Expire le</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div className="font-medium">{sub.user?.email ?? sub.userId}</div>
                          <div className="text-xs text-muted-foreground">{sub.reference}</div>
                        </TableCell>
                        <TableCell>{sub.plan}</TableCell>
                        <TableCell>
                          <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>{sub.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(sub.currentPeriodEnd)}</TableCell>
                        <TableCell className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleExtendSubscription(sub.id, 30)}
                          >
                            +30j
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => handleDeleteSubscription(sub.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun utilisateur.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Code parrainage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.slice(0, 6).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="font-medium">{user.email}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(user.createdAt)}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>{user.role}</Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(user.balanceCommission)}</TableCell>
                        <TableCell>{user.referralCode}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Transactions récentes</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {latestTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune transaction.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latestTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div className="font-medium">{tx.user?.email ?? '—'}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</div>
                        </TableCell>
                        <TableCell className="capitalize">{tx.type}</TableCell>
                        <TableCell>{formatCurrency(tx.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={tx.status === 'succeeded' ? 'default' : 'secondary'}>
                            {tx.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-xl border bg-background/60 p-4">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-2xl font-semibold">{value}</p>
  </div>
);
