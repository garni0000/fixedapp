import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const mockHistory = [
  {
    id: '1',
    date: new Date(Date.now() - 86400000).toISOString(),
    homeTeam: 'PSG',
    awayTeam: 'Lyon',
    market: '1',
    status: 'win' as const,
    result: '2-1',
  },
  {
    id: '2',
    date: new Date(Date.now() - 172800000).toISOString(),
    homeTeam: 'Bayern',
    awayTeam: 'Dortmund',
    market: 'Over 2.5',
    status: 'lose' as const,
    result: '1-1',
  },
  {
    id: '3',
    date: new Date().toISOString(),
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    market: 'X2',
    status: 'pending' as const,
  },
];

export default function History() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'win':
        return <CheckCircle className="h-5 w-5 text-neon-green" />;
      case 'lose':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      win: 'bg-neon-green/20 text-neon-green border-neon-green/30',
      lose: 'bg-destructive/20 text-destructive border-destructive/30',
      pending: 'bg-muted text-muted-foreground border-muted',
    };
    
    return variants[status as keyof typeof variants] || variants.pending;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-cyan to-neon-green bg-clip-text text-transparent">
          Historique des Fixed
        </h1>

        <div className="space-y-4">
          {mockHistory.map((item) => (
            <Card key={item.id} className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {item.homeTeam} vs {item.awayTeam}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(item.status)}
                    <Badge className={getStatusBadge(item.status)}>
                      {item.status === 'win' && 'Gagné'}
                      {item.status === 'lose' && 'Perdu'}
                      {item.status === 'pending' && 'En attente'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {new Date(item.date).toLocaleDateString('fr-FR')}
                  </span>
                  <Badge variant="outline" className="neon-border">
                    {item.market}
                  </Badge>
                </div>
                {item.result && (
                  <div className="text-sm text-muted-foreground">
                    Résultat: <span className="font-medium text-foreground">{item.result}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
