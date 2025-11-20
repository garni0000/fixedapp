import { Fixed } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Lock } from 'lucide-react';
import { useState } from 'react';
import { AnalysisModal } from './AnalysisModal';

interface FixedCardProps {
  fixed: Fixed;
  userIsVIP: boolean;
}

export const FixedCard = ({ fixed, userIsVIP }: FixedCardProps) => {
  const [showModal, setShowModal] = useState(false);

  const canViewAnalysis = !fixed.isVIP || userIsVIP;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-neon-orange';
    if (confidence >= 80) return 'text-neon-orange-dark';
    return 'text-muted-foreground';
  };

  return (
    <>
      <div className="glass-card rounded-xl p-6 hover:border-primary/50 transition-all duration-300 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        
        {fixed.isVIP && (
          <Badge className="vip-badge absolute top-4 right-4 glow-gold">
            VIP
          </Badge>
        )}

        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {new Date(fixed.date).toLocaleDateString('fr-FR')}
            </div>
            <div className={`flex items-center space-x-2 ${getConfidenceColor(fixed.confidence)}`}>
              <TrendingUp className="h-4 w-4" />
              <span className="font-bold text-lg">{fixed.confidence}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xl font-bold">
              {fixed.homeTeam} <span className="text-muted-foreground">vs</span> {fixed.awayTeam}
            </div>
            <Badge variant="outline" className="neon-border">
              {fixed.market}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            {fixed.shortAnalysis}
          </p>

          {canViewAnalysis ? (
            <Button
              onClick={() => setShowModal(true)}
              className="w-full neon-border hover:glow-orange"
            >
              Voir l'analyse complète
            </Button>
          ) : (
            <Button
              disabled
              className="w-full bg-muted text-muted-foreground cursor-not-allowed"
            >
              <Lock className="h-4 w-4 mr-2" />
              Réservé aux VIP
            </Button>
          )}
        </div>
      </div>

      <AnalysisModal
        open={showModal}
        onClose={() => setShowModal(false)}
        fixed={fixed}
      />
    </>
  );
};
