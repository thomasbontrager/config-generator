import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [userCount, configCount, activeSubCount, totalRevenue, recentUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.generatedConfig.count(),
      prisma.user.count({ where: { subscriptionStatus: 'ACTIVE' } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCEEDED' },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          name: true,
          email: true,
          subscriptionStatus: true,
          role: true,
          createdAt: true,
          _count: { select: { generatedConfigs: true } },
        },
      }),
    ]);

  const totalRevenueAmount = totalRevenue._sum.amount ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground mt-2">
          Platform overview and user management
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeSubCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Configs Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{configCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${(totalRevenueAmount / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent users table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-3 pr-4 font-medium">User</th>
                  <th className="text-left py-3 pr-4 font-medium">Status</th>
                  <th className="text-left py-3 pr-4 font-medium">Role</th>
                  <th className="text-left py-3 pr-4 font-medium">Configs</th>
                  <th className="text-left py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="font-medium">{user.name ?? '—'}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          user.subscriptionStatus === 'ACTIVE'
                            ? 'bg-green-500/10 text-green-400'
                            : user.subscriptionStatus === 'TRIAL'
                            ? 'bg-cyan-500/10 text-cyan-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {user.subscriptionStatus}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`text-xs font-medium ${
                          user.role === 'ADMIN' ? 'text-violet-400' : 'text-muted-foreground'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {user._count.generatedConfigs}
                    </td>
                    <td className="py-3 text-muted-foreground text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
