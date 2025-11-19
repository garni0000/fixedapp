import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const copyAffiliateLink = () => {
    const link = `https://fixedmatch.app/ref/${user?.affiliateCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Lien copié !');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-cyan to-neon-green bg-clip-text text-transparent">
          Mon Profile
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Informations</span>
                {user?.isVIP && (
                  <Badge className="vip-badge glow-gold">
                    <Crown className="h-3 w-3 mr-1" />
                    VIP
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email} disabled />
              </div>
              <div className="space-y-2">
                <Label>Nom d'utilisateur</Label>
                <Input value={user?.displayName} disabled />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Abonnement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Statut</span>
                  <Badge variant={user?.isVIP ? 'default' : 'secondary'}>
                    {user?.isVIP ? 'VIP Actif' : 'Gratuit'}
                  </Badge>
                </div>
                {user?.subscriptionEnd && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Expire le</span>
                    <span className="text-sm font-medium">
                      {new Date(user.subscriptionEnd).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>
              <Button
                className="w-full neon-border hover:glow-cyan"
                onClick={() => navigate('/payment')}
              >
                {user?.isVIP ? 'Prolonger' : 'Devenir VIP'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Lien d'affiliation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Partagez votre lien unique et gagnez des récompenses pour chaque nouveau membre !
            </p>
            <div className="flex items-center space-x-2">
              <Input
                value={`https://fixedmatch.app/ref/${user?.affiliateCode}`}
                disabled
                className="flex-1"
              />
              <Button
                onClick={copyAffiliateLink}
                size="icon"
                className="neon-border"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Historique des paiements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Aucun paiement pour le moment
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
