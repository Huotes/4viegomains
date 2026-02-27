import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge, RoleBadge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Loading'
import type { Role } from '@/lib/types'
import { ROLE_LABELS, ROLES } from '@/lib/constants'

interface MatchupsPageProps {
  params: {
    role: string
  }
}

export function generateStaticParams() {
  return ROLES.map((role) => ({
    role,
  }))
}

export function generateMetadata({ params }: MatchupsPageProps) {
  return {
    title: `Viego ${ROLE_LABELS[params.role as Role]} Matchups — 4ViegoMains`,
    description: `Detailed matchup analysis for Viego vs every champion in ${ROLE_LABELS[params.role as Role]}.`,
  }
}

export default function MatchupsPage({
  params,
}: MatchupsPageProps): React.ReactElement {
  const role = params.role as Role
  const isValidRole = ROLES.includes(role)

  if (!isValidRole) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-shadow-black to-shadow-dark flex items-center justify-center">
        <Card>
          <CardContent className="text-center">
            <p className="text-red-400 font-semibold">Invalid role: {params.role}</p>
            <p className="text-gray-400 mt-2">Valid roles: {ROLES.join(', ')}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-shadow-black to-shadow-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="font-cinzel text-4xl font-bold gradient-text-soul">
                  {ROLE_LABELS[role]} Matchups
                </h1>
                <RoleBadge role={role} />
              </div>
              <p className="text-gray-400">
                Comprehensive matchup data and strategy for Viego vs every champion in the {ROLE_LABELS[role]} role.
              </p>
            </div>

            {/* Matchups List */}
            <div className="space-y-6">
              <SkeletonCard count={3} />
            </div>
          </div>

          {/* Sidebar */}
          <Sidebar currentRole={role} />
        </div>
      </div>
    </div>
  )
}
