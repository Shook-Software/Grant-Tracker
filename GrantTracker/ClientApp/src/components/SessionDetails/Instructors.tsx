import * as React from 'react';

export default ({ session }): JSX.Element => {
  return (
      <React.Fragment>
        <h3 className="text-lg font-semibold m-0">Instructors</h3>
        <div className='flex flex-row flex-wrap divide-y divide-gray-200'>
          {session!.instructors.map(isy => (
            <div className='py-2 px-4 w-1/2 text-sm'>
              {`${isy.instructor.firstName} ${isy.instructor.lastName}`}
            </div>
          ))}
        </div>
      </React.Fragment>
  )
}