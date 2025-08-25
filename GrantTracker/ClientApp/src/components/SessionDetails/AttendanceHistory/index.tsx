import { useState, useEffect, useContext, useRef } from 'react'
import { Locale } from '@js-joda/locale_en-us'
import { DateTimeFormatter, LocalDate } from '@js-joda/core'
import { Link } from 'react-router-dom'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ComboboxDropdownMenu, ComboboxDropdownMenuItem, ComboboxDropdownMenuItemClassName } from '@/components/Dropdown'
import { DropdownMenuItemClassName } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/Spinner'
import RecordDisplay from './RecordDisplay'
import { CopyAttendanceModal } from 'components/Modals/CopyAttendanceModal'

import { SimpleAttendanceView } from 'Models/StudentAttendance'
import { PayPeriod } from 'Models/PayPeriod'
import { OrgYearContext } from 'pages/Admin'
import { deleteAttendanceRecord } from '../api'
import { AppContext } from 'App'
import paths from 'utils/routing/paths'
import api from 'utils/api'


interface Props {
  sessionGuid: string
  sessionName: string
  attendanceRecords: SimpleAttendanceView[]
  onChange
  sessionType: string
}

export default ({sessionGuid, sessionName, attendanceRecords, onChange, sessionType}: Props): JSX.Element => {
  const [showCopyModal, setShowCopyModal] = useState<boolean>(false)
  const [showDeletionModal, setShowDeletionModal] = useState<boolean>(false)
  const [recordToDelete, setRecordToDelete] = useState<SimpleAttendanceView | null>(null)
  const [recordToCopy, setRecordToCopy] = useState<SimpleAttendanceView | null>(null)
  const modalScrollRef = useRef<HTMLDivElement>(null)

  const { sessionsQuery } = useContext(OrgYearContext)

  function handleDeleteClick(record) {
    deleteAttendanceRecord(record.guid)
      .then(res => onChange())
  }

  function openDeleteDialog(record: SimpleAttendanceView) {
    setRecordToDelete(record)
    setShowDeletionModal(true)
  }

  function closeDeleteDialog() {
    setShowDeletionModal(false)
    setRecordToDelete(null)
  }

  function openCopyDialog(record: SimpleAttendanceView) {
    setRecordToCopy(record)
    setShowCopyModal(true)
  }

  function closeCopyDialog() {
    setShowCopyModal(false)
    setRecordToCopy(null)
  }

  // Scroll to top when copy modal opens
  useEffect(() => {
    if (showCopyModal && modalScrollRef.current) {
      modalScrollRef.current.scrollTop = 0
    }
  }, [showCopyModal])
  
  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-medium'>Attendance History</h3>

      {attendanceRecords && attendanceRecords.length > 0 && (
        <AttendanceExport sessionGuid={sessionGuid} attendanceRecords={attendanceRecords} />
      )}

      {attendanceRecords.length === 0 ? (
        <p className='text-gray-600 text-center py-8'>No attendance records found.</p>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {attendanceRecords.map((record, index) => (
            <AccordionItem key={index} value={`record-${index}`} className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center justify-between w-full mr-4">
                  <span className="font-medium w-50">
                    {record.instanceDate.format(DateTimeFormatter.ofPattern('EEEE, MMMM d, yyyy').withLocale(Locale.ENGLISH))}
                  </span>

                  <span className="text-sm text-gray-600 text-center">
                    {record.studentCount || 0} students
                  </span>

                  <ComboboxDropdownMenu aria-label="Open attendance options">
                    <div className={DropdownMenuItemClassName}>
                      <Link className='block w-full' to={`${paths.Admin.Attendance.path}?session=${sessionGuid}&attendanceId=${record.guid}`}>
                        Edit
                      </Link>
                    </div>
                    {sessionType === 'student' && (
                      <ComboboxDropdownMenuItem onClick={() => openCopyDialog(record)} label='Copy' />
                    )}
              
                    <ComboboxDropdownMenuItem 
                      variant='destructive'
                      label='Delete'
                      onClick={() => openDeleteDialog(record)}
                    />
                  </ComboboxDropdownMenu>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4">
                <RecordDisplay 
                  sessionGuid={sessionGuid} 
                  sessionName={sessionName}
                  simpleRecord={record} 
                  sessionType={sessionType}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Copy Attendance Dialog */}
      <Dialog open={showCopyModal} onOpenChange={closeCopyDialog}>
        <DialogContent className='w-4xl max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col'>
          <DialogHeader className='flex-shrink-0'>
            <DialogTitle>
              Copying Attendance for {sessionName}, {recordToCopy?.instanceDate.format(DateTimeFormatter.ofPattern('eeee, MMMM dd').withLocale(Locale.ENGLISH))}
            </DialogTitle>
          </DialogHeader>
          <div ref={modalScrollRef} data-scroll-container className='flex-1 overflow-y-auto'>
            {recordToCopy && (
              <CopyAttendanceModal 
                sourceSessionGuid={sessionGuid} 
                sourceAttendanceGuid={recordToCopy.guid} 
                sourceDate={recordToCopy.instanceDate} 
                sessions={sessionsQuery?.data || []} 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeletionModal} onOpenChange={setShowDeletionModal}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Delete Attendance Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the record for{' '}
              <strong>
                {recordToDelete?.instanceDate.format(DateTimeFormatter.ofPattern('eeee, MMMM d').withLocale(Locale.ENGLISH))}
              </strong>
              ? This action is permanent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              size='sm'
              variant='secondary'
              onClick={closeDeleteDialog}
            >
              Cancel
            </Button>
            <Button 
              size='sm'
              variant='destructive'
              onClick={() => {
                if (recordToDelete) {
                  handleDeleteClick(recordToDelete)
                }
                closeDeleteDialog()
              }}
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ExportProps {
  sessionGuid: string
  attendanceRecords: SimpleAttendanceView[]
}

const AttendanceExport = ({sessionGuid, attendanceRecords}: ExportProps): JSX.Element => {
  attendanceRecords.sort((a, b) => a.instanceDate.compareTo(b.instanceDate));
	const { data } = useContext(AppContext)
  const { orgYear, setOrgYear } = useContext(OrgYearContext)
  const [payPeriod, setPayPeriod] = useState<PayPeriod | undefined>(undefined);
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const [hasSubmitError, setHasSubmitError] = useState<boolean>(false);

  function downloadExcelReport() {
    if (!payPeriod)
      return;

    setIsDownloading(true);
    setHasSubmitError(false);

    api.get(`session/${sessionGuid}/attendance/export?startDate=${payPeriod.startDate}&endDate=${payPeriod.endDate}`, {
      responseType: 'blob'
    })
    .then(res => {
      const href = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = href;

      let startDateStr: string = payPeriod.startDate.format(DateTimeFormatter.ofPattern('yyyy-MM-dd').withLocale(Locale.ENGLISH));
      let endDateStr: string = payPeriod.endDate.format(DateTimeFormatter.ofPattern('yyyy-MM-dd').withLocale(Locale.ENGLISH));
      link.setAttribute('download', `${orgYear?.organization.name.replaceAll(' ', '-')}_Attendance_Printout_${startDateStr}-to-${endDateStr}.xlsx`)

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    })
    .catch(err => {
      setHasSubmitError(true);
    })
    .finally(() => {
      setIsDownloading(false);
    })
  }

  const payrollPeriods = data.payrollYears.filter(py => py.years.some(y => y.yearGuid == orgYear?.year.guid)).flatMap(py => py.periods)

  let firstAttendanceDate = attendanceRecords[0].instanceDate;
  let lastAttendanceDate = attendanceRecords[attendanceRecords.length - 1].instanceDate;

  if (!payrollPeriods || payrollPeriods.length === 0)
    return <></>;
  
  return (
    <div className='text-base'>
      <div className='space-y-2 flex gap-3'>
        <div>
          <Select 
            value={payPeriod?.period?.toString() || ""} 
            onValueChange={(value) => setPayPeriod(payrollPeriods.find(p => p.period.toString() === value))}
          >
            <SelectTrigger id='export-pay-period' className='w-64'>
              <SelectValue placeholder="Select pay period" />
            </SelectTrigger>
            <SelectContent>
              {payrollPeriods
                .filter((p: PayPeriod) => p.startDate.isEqual(firstAttendanceDate) || p.startDate.isBefore(lastAttendanceDate))
                .filter((p: PayPeriod) => p.endDate.isEqual(lastAttendanceDate) || p.endDate.isAfter(firstAttendanceDate))
                .map(p => (
                  <SelectItem key={p.period} value={p.period.toString()}>
                    {p.startDate.toString()} to {p.endDate.toString()}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      
        <Button 
          onClick={downloadExcelReport} 
          disabled={isDownloading || !payPeriod}
          className='min-w-[100px]'
        >
          {isDownloading ? (
            <>
              <Spinner size='sm' className='mr-2' />
              Exporting...
            </>
          ) : (
            'Export'
          )}
        </Button>
      </div>

      {hasSubmitError && (
        <div className='mt-3 p-2 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-sm text-red-600'>
            Something went wrong, please check the dates and try again, or contact an administrator if issues continue.
          </p>
        </div>
      )}
    </div>
  )
}

