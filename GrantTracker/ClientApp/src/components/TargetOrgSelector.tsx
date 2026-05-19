import React, { useContext } from 'react'
import { Combobox } from '@/components/ui/combobox'
import { Label } from '@/components/ui/label'
import { OrgYearContext } from 'pages/Admin'
import { OrganizationYearView } from 'Models/OrganizationYear'

interface TargetOrgSelectorProps {
  value: string | undefined
  onChange: (orgYearGuid: string) => void
  label?: string
  className?: string
}

/**
 * A selector component for choosing a target organization when multiple orgs are selected.
 * Used during add operations (sessions, instructors, students) to specify which org
 * the new item should be added to.
 *
 * Returns null if only one organization is selected (no selection needed).
 */
export function TargetOrgSelector({
  value,
  onChange,
  label = "Target Organization",
  className = ""
}: TargetOrgSelectorProps): React.ReactElement | null {
  const { selectedOrganizations, selectedYear, orgYears } = useContext(OrgYearContext)

  // If single org selected, no selector needed
  if (selectedOrganizations.length <= 1) {
    return null
  }

  const options = selectedOrganizations.map(org => {
    const orgYear = orgYears.find(oy =>
      oy.organization.guid === org.guid &&
      oy.year.guid === selectedYear?.guid
    )
    return {
      value: orgYear?.guid || '',
      label: org.name
    }
  }).filter(opt => opt.value !== '')

  return (
    <div className={`w-fit max-w-xs ${className}`}>
      <Label className='mb-2' htmlFor='target-org-select'>{label}</Label>
      <Combobox
        id='target-org-select'
        options={options}
        value={value || ''}
        onChange={(val) => onChange(Array.isArray(val) ? val[0] : val)}
        placeholder="Select target organization..."
        emptyText="No organizations available"
      />
    </div>
  )
}

/**
 * Hook to get the target orgYear for add operations.
 * Returns the orgYear directly if single org selected,
 * or undefined if multiple orgs selected (caller must prompt user).
 */
export function useTargetOrgYear(): OrganizationYearView | undefined {
  const { selectedOrganizations, selectedYear, orgYears } = useContext(OrgYearContext)

  // If single org selected, return it directly
  if (selectedOrganizations.length === 1 && selectedYear) {
    return orgYears.find(oy =>
      oy.organization.guid === selectedOrganizations[0].guid &&
      oy.year.guid === selectedYear.guid
    )
  }

  // Multiple orgs - need user selection
  return undefined
}

/**
 * Returns true if multiple organizations are currently selected,
 * meaning the user needs to choose a target org for add operations.
 */
export function useNeedsTargetOrgSelection(): boolean {
  const { selectedOrganizations } = useContext(OrgYearContext)
  return selectedOrganizations.length > 1
}

export default TargetOrgSelector
