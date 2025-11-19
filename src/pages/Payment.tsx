import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Smartphone, Wallet } from 'lucide-react';
import { toast } from 'sonner';

const subscriptions = [
  { type: '1month', duration: '1 mois', price: 4 },
  { type: '3months', duration: '3 mois', price: 8 },
  { type: '1year', duration: '1 an', price: 25 },
];

export default function Payment() {
  const [selectedPlan, setSelectedPlan] = useState('1month');
  const [mobileNumber, setMobileNumber] = useState('');
  const [operator, setOperator] = useState('');
  const [crypto, setCrypto] = useState('BTC');
  const [cryptoEmail, setCryptoEmail] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const handleMobileMoneySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Demande de paiement envoyée !');
  };

  const handleCryptoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshot) {
      toast.error('Veuillez télécharger une capture d\'écran');
      return;
    }
    toast.success('Demande de paiement crypto envoyée !');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-cyan to-neon-green bg-clip-text text-transparent">
          Abonnements VIP
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptions.map((sub) => (
            <Card
              key={sub.type}
              className={`glass-card cursor-pointer transition-all ${
                selectedPlan === sub.type ? 'neon-border glow-cyan' : ''
              }`}
              onClick={() => setSelectedPlan(sub.type)}
            >
              <CardHeader>
                <CardTitle>{sub.duration}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">${sub.price}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Check className="h-4 w-4 text-neon-green" />
                  <span>Accès tous les fixed VIP</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Check className="h-4 w-4 text-neon-green" />
                  <span>Analyses complètes IA</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Check className="h-4 w-4 text-neon-green" />
                  <span>Notifications temps réel</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Méthode de paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="mobile">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mobile">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mobile Money
                </TabsTrigger>
                <TabsTrigger value="crypto">
                  <Wallet className="h-4 w-4 mr-2" />
                  Crypto
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mobile" className="space-y-4 mt-6">
                <form onSubmit={handleMobileMoneySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="operator">Opérateur</Label>
                    <Select value={operator} onValueChange={setOperator} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un opérateur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                        <SelectItem value="orange">Orange Money</SelectItem>
                        <SelectItem value="moov">Moov Money</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile">Numéro de téléphone</Label>
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="+225 XX XX XX XX XX"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Montant</Label>
                    <Input
                      value={`$${subscriptions.find(s => s.type === selectedPlan)?.price}`}
                      disabled
                    />
                  </div>

                  <Button type="submit" className="w-full neon-border hover:glow-cyan">
                    Envoyer la demande
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="crypto" className="space-y-4 mt-6">
                <form onSubmit={handleCryptoSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="crypto">Crypto-monnaie</Label>
                    <Select value={crypto} onValueChange={setCrypto}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                        <SelectItem value="USDT">Tether (USDT)</SelectItem>
                        <SelectItem value="SOL">Solana (SOL)</SelectItem>
                        <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="crypto-email">Email</Label>
                    <Input
                      id="crypto-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={cryptoEmail}
                      onChange={(e) => setCryptoEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="screenshot">Capture d'écran du paiement</Label>
                    <Input
                      id="screenshot"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full neon-border hover:glow-cyan">
                    Soumettre la preuve
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
