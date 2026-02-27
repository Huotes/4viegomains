import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Loading'

export const metadata = {
  title: 'Viego Analytics Dashboard — 4ViegoMains',
  description:
    'Comprehensive Viego analytics including meta stats, win rates by role, and patch impact analysis.',
}

export default function AnalyticsPage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-b from-shadow-black to-shadow-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-cinzel text-4xl font-bold gradient-text-soul mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-400">
            Real-time Viego meta analysis across all roles and regions.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card glow="mist">
            <CardContent className="flex justify-between items-center">
              <div>
                <p className="text-sm text-mist-cyan/70 uppercase tracking-wider mb-2">Overall Win Rate</p>
                <p className="text-3xl font-bold gradient-text-mist">52.3%</p>
              </div>
              <div className="text-4xl opacity-20">📊</div>
            </CardContent>
          </Card>

          <Card glow="ruination">
            <CardContent className="flex justify-between items-center">
              <div>
                <p className="text-sm text-mist-cyan/70 uppercase tracking-wider mb-2">Average Pick Rate</p>
                <p className="text-3xl font-bold gradient-text-ruination">8.7%</p>
              </div>
              <div className="text-4xl opacity-20">📈</div>
            </CardContent>
          </Card>

          <Card glow="mist">
            <CardContent className="flex justify-between items-center">
              <div>
                <p className="text-sm text-mist-cyan/70 uppercase tracking-wider mb-2">Average Ban Rate</p>
                <p className="text-3xl font-bold gradient-text-mist">12.1%</p>
              </div>
              <div className="text-4xl opacity-20">🚫</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <Card glow="mist">
            <CardHeader>
              <CardTitle>Win Rate Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <SkeletonCard count={2} />
              </div>
            </CardContent>
          </Card>

          <Card glow="ruination">
            <CardHeader>
              <CardTitle>Pick Rate by Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <SkeletonCard count={2} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role Statistics */}
        <div className="mb-12">
          <h2 className="font-cinzel text-2xl font-bold mb-6 gradient-text-soul">Stats by Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {['Top', 'Jungle', 'Mid', 'Bot', 'Support'].map((role) => (
              <Card key={role} glow="mist">
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-cinzel font-bold">{role}</h3>
                    <Badge variant="default" className="text-xs">
                      {(Math.random() * 20 + 45).toFixed(1)}%
                    </Badge>
                  </div>
                  <SkeletonCard count={2} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Item Statistics */}
        <Card glow="mist">
          <CardHeader>
            <CardTitle>Top Items by Popularity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <SkeletonCard count={5} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
