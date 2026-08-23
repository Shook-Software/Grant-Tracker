import * as React from 'react';

export default ({ session }): JSX.Element => {
  return (
      <React.Fragment>
        <h3 className="text-lg font-semibold m-0">Instructors</h3>
        <div className='flex flex-row flex-wrap divide-y divide-gray-200'>
          {session!.instructors.map(isy => (
            <div key={isy.guid} className='py-2 px-4 w-1/2 text-sm flex justify-between gap-2'>
              <span>{`${isy.instructor.firstName} ${isy.instructor.lastName}`}</span>
              <span className='text-muted-foreground' title={isy.fundingSource?.label}>
                {isy.fundingSource ? (isy.fundingSource.abbreviation || isy.fundingSource.label) : '—'}
              </span>
            </div>
          ))}
        </div>
      </React.Fragment>
  )
}