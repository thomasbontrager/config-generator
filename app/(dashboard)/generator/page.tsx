'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const configTypes = [
  { id: 'vite-react', name: 'Vite + React', icon: '⚛️', category: 'Frontend' },
  { id: 'vue3', name: 'Vue 3', icon: '💚', category: 'Frontend' },
  { id: 'next', name: 'Next.js', icon: '▲', category: 'Frontend' },
  { id: 'express', name: 'Express.js', icon: '🚀', category: 'Backend' },
  { id: 'django', name: 'Django', icon: '🐍', category: 'Backend' },
  { id: 'docker', name: 'Docker', icon: '🐳', category: 'DevOps' },
  { id: 'k8s', name: 'Kubernetes', icon: '☸️', category: 'DevOps' },
  { id: 'github-actions', name: 'GitHub Actions', icon: '⚙️', category: 'CI/CD' },
];

export default function GeneratorPage() {
  const { toast } = useToast();
  const [selectedConfigs, setSelectedConfigs] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleConfig = (id: string) => {
    setSelectedConfigs((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (selectedConfigs.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No configs selected',
        description: 'Please select at least one configuration type',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configTypes: selectedConfigs }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      toast({
        title: 'Success!',
        description: 'Your configuration has been generated',
      });

      // Trigger download
      if (data.downloadUrl) {
        window.location.href = data.downloadUrl;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const categories = [...new Set(configTypes.map((c) => c.category))];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Config Generator</h1>
        <p className="text-muted-foreground mt-2">
          Select the configurations you want to generate
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Stack Components</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="text-sm font-semibold mb-3 text-primary">{category}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {configTypes
                    .filter((c) => c.category === category)
                    .map((config) => (
                      <div
                        key={config.id}
                        className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                          selectedConfigs.includes(config.id)
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => toggleConfig(config.id)}
                      >
                        <div className="text-3xl mb-2">{config.icon}</div>
                        <div className="font-medium text-sm">{config.name}</div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedConfigs.length} configuration{selectedConfigs.length !== 1 ? 's' : ''} selected
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || selectedConfigs.length === 0}
              size="lg"
            >
              {isGenerating ? 'Generating...' : 'Generate & Download ZIP'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
