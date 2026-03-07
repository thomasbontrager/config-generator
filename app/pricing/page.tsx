import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] to-[#16213e]">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-300">Choose the plan that fits your needs</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Free Trial</CardTitle>
              <CardDescription>Perfect for trying out</CardDescription>
              <div className="text-4xl font-bold mt-4">$0</div>
              <p className="text-sm text-muted-foreground">14 days free</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>✓ 10 config generations</li>
                <li>✓ All templates</li>
                <li>✓ ZIP downloads</li>
                <li>✓ Basic support</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/auth/signup" className="w-full">
                <Button variant="outline" className="w-full">Start Free Trial</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <div className="text-xs font-semibold text-primary mb-2">MOST POPULAR</div>
              <CardTitle>Pro</CardTitle>
              <CardDescription>For serious developers</CardDescription>
              <div className="text-4xl font-bold mt-4">$29</div>
              <p className="text-sm text-muted-foreground">per month</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>✓ Unlimited generations</li>
                <li>✓ All templates</li>
                <li>✓ Priority support</li>
                <li>✓ Config history</li>
                <li>✓ Early access to new features</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/auth/signup" className="w-full">
                <Button className="w-full">Get Started</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Link href="/">
            <Button variant="ghost">← Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
