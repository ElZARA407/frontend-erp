'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { FactureForm } from '@/components/features/factures/facture-form'

export default function NouvelleFacturePage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Nouvelle facture"
        subtitle="Sélectionne un ou plusieurs BL puis crée la facture depuis cette page."
        actions={
          <Link href="/factures">
            <Button variant="outline" icon={<ArrowLeft className="h-3.5 w-3.5" />}>
              Retour liste
            </Button>
          </Link>
        }
      />

      <Card>
        <CardBody className="p-5">
          <FactureForm />
        </CardBody>
      </Card>
    </div>
  )
}