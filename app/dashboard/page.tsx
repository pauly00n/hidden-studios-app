'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [mapCode, setMapCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const apiKey = 'a875fc407cb5b343e07a2d26a1e568fa'
      const htmlRes = await fetch(`http://api.scraperapi.com?api_key=${apiKey}&url=https://fortnite.gg/island?code=${mapCode}`);
      const html = await htmlRes.text();
      
      const match = html.match(/data-id=["'](\d+)["']/);
      const id = match?.[1];
      if (!id) throw new Error('Could not find internal map ID'); 

      const response = await fetch(`/api/fortnite?id=${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch map data');
      }
      const data = await response.json();
      if (!data) {
        throw new Error('No data returned from API');
      }
      
      // Store the data in localStorage for the next page
      localStorage.setItem('mapData', JSON.stringify(data));
      
      // Navigate to the dynamic route
      router.push(`/dashboard/${mapCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-card rounded-lg border p-6">
        <h1 className="text-2xl font-bold mb-6">Map Lookup</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Map Code
            </label>
            <div className="flex gap-2">
              <Input
                value={mapCode}
                onChange={(e) => setMapCode(e.target.value)}
                placeholder="Enter map code"
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !mapCode}>
                {isLoading ? 'Loading...' : 'Search'}
              </Button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}