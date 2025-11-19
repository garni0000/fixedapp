import { Fixed } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface AnalysisModalProps {
  open: boolean;
  onClose: () => void;
  fixed: Fixed;
}

export const AnalysisModal = ({ open, onClose, fixed }: AnalysisModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-neon-cyan to-neon-green bg-clip-text text-transparent">
            Analyse Complète
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="space-y-2">
            <div className="text-xl font-bold">
              {fixed.homeTeam} <span className="text-muted-foreground">vs</span> {fixed.awayTeam}
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="neon-border">
                {fixed.market}
              </Badge>
              <div className="flex items-center space-x-2 text-neon-green">
                <TrendingUp className="h-4 w-4" />
                <span className="font-bold">{fixed.confidence}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-primary">
              Analyse IA
            </h3>
            <div className="glass-card p-4 rounded-lg text-sm leading-relaxed">
              {fixed.fullAnalysis}
            </div>
          </div>

          <div className="glass-card p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-primary">Points clés</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Forme récente des équipes</li>
              <li>• Statistiques face à face</li>
              <li>• Conditions de jeu</li>
              <li>• Composition probable</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
