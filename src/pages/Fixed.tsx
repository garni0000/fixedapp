import { useFetchFixed } from '@/hooks/useFetchFixed';
import { useAuth } from '@/hooks/useAuth';
import { FixedCard } from '@/components/fixed/FixedCard';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

export default function Fixed() {
  const { fixed, loading, quotaUsed, maxQuota } = useFetchFixed();
  const { user } = useAuth();

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
        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-cyan to-neon-green bg-clip-text text-transparent">
            Fixed du Jour
          </h1>
          
          <div className="glass-card p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Quota du jour</span>
              <span className="font-bold text-primary">
                {quotaUsed} / {maxQuota}
              </span>
            </div>
            <Progress value={(quotaUsed / maxQuota) * 100} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fixed.map((item) => (
            <FixedCard
              key={item.id}
              fixed={item}
              userIsVIP={user?.isVIP || false}
            />
          ))}
        </div>

        {fixed.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              Aucun fixed disponible pour le moment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
