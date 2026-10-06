import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ExtractedRow } from '@/components/ui/ExtractedRow'
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge'
import { DosageDots } from '@/components/ui/DosageDots'

describe('UI Components', () => {
  it('DosageDots renders 4 slots', () => {
    render(<DosageDots pattern="1-0-1" showLabels={true} />)
    expect(screen.getByText('Morn')).toBeInTheDocument()
    expect(screen.getByText('Night')).toBeInTheDocument()
  })

  it('ConfidenceBadge renders high confidence style', () => {
    render(<ConfidenceBadge confidence={0.9} />)
    expect(screen.getByText('90%')).toBeInTheDocument()
    expect(screen.getByText('High confidence')).toBeInTheDocument()
  })

  it('ConfidenceBadge renders low confidence style', () => {
    render(<ConfidenceBadge confidence={0.5} />)
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('Verify with prescription')).toBeInTheDocument()
  })

  it('ExtractedRow renders data correctly', () => {
    render(
      <ExtractedRow 
        medicineName="Amoxicillin" 
        dosage="500mg" 
        frequency="1-1-1" 
        duration="5 days"
        confidence={0.88}
        instructions="After food"
      />
    )
    expect(screen.getByText('Amoxicillin')).toBeInTheDocument()
    expect(screen.getByText('500mg')).toBeInTheDocument()
    expect(screen.getByText('After food')).toBeInTheDocument()
    expect(screen.getByText('High confidence')).toBeInTheDocument()
  })
})
