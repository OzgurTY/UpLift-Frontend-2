import Announcements from '@/components/Announcements'
import BigCalendar from '@/components/BigCalendar'
import MoodForm from '@/components/MoodForm'
import GoalForm from '@/components/GoalForm'
import React from 'react'

const PatientPage = () => {
  return (
    <div className='flex-1 p-4 flex gap-4 flex-col xl:flex-row'>
      {/* LEFT */}
      <div className='w-full xl:w-2/3'>
        <div className='h-full bg-white p-4 rounded-md'>
          <h1 className='text-xl font-semibold'>Schedule</h1>
          <BigCalendar therapistId="exampleTherapistId" />
        </div>
      </div>

      {/* RIGHT */}
      <div className='w-full xl:w-1/3 flex flex-col gap-8'>
        <MoodForm />
        <GoalForm />
        <Announcements />
      </div>
    </div>
  )
}

export default PatientPage;
