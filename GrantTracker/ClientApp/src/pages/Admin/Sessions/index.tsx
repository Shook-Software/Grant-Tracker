import { useState, useEffect, useContext } from 'react'
import { Container, Spinner, Form, Button, Card, Row, Col } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LocalDate } from '@js-joda/core'

import CopyRegistrations from './CopyRegistrations'
import RegisterInstructor from 'pages/Admin/Shared/RegisterInstructor'
import AddButton from 'components/Input/Button'
import SessionDetails from 'components/SessionDetails'
import Table, { Column, SortDirection } from 'components/BTable'
import { OrgYearContext } from 'pages/Admin'

import { DayOfWeek } from 'Models/DayOfWeek'
import { SimpleSessionView } from 'Models/Session'
import { DropdownOption } from 'types/Session'

import paths from 'utils/routing/paths'
import api from 'utils/api'
import { IdentityClaim, User } from 'utils/authentication'


export default ({user}: { user: User}): JSX.Element => {
    document.title = 'GT - Admin / Sessions'
    const navigate = useNavigate()
    const { sessionGuid } = useParams()
    const { orgYear, setOrgYear, sessionsQuery, instructorsQuery } = useContext(OrgYearContext)
    const [searchTerm, setSearchTerm] = useState<string>('')

    const { isPending: missingLoading, data: missingAttendance } = useQuery<AttendanceRecord[]>({
        queryKey: [`organizationYear/${orgYear?.guid}/Attendance/Missing`],
        enabled: orgYear?.guid !== undefined
    })

    function handleSearchTermChange(term) {
        term = term.toLocaleLowerCase()
        setSearchTerm(term)
    }

    useEffect(() => {
        if (sessionGuid)
            api.get(`/session/${sessionGuid}/orgYear`)
                .then(res => setOrgYear(res.data))
    }, [sessionGuid])

    let columns: Column[] = createColumns(missingAttendance, sessionGuid)
    let rowClick = null
    if (sessionGuid != null) {
        columns = [columns[0]]
        rowClick = (event, row) => navigate(`${paths.Admin.path}/${paths.Admin.Tabs.Sessions.path}/${row.sessionGuid}`)
    }

    if (!sessionsQuery || !instructorsQuery || sessionsQuery?.isPending || missingLoading)
        return <Spinner animation='border' />

    return (
        <>
            <Container className='pt-3'>
                <div className='d-flex mb-3'>
                    <div>
                        <h4 className='m-0 me-3 text-align-center'>Sessions for {orgYear?.organization.name}</h4>
                        <small className='text-danger'>* Red sessions are missing attendance records</small>
                    </div>
                    <div style={{display: user.claim == IdentityClaim.Teacher ? 'none' : 'auto'}}>
                        <AddButton
                            as={Link}
                            to={`${paths.Edit.path}/${paths.Edit.Sessions.path}/overview?orgYearGuid=${orgYear?.guid}`}
                        >
                            Add New Session
                        </AddButton>
                    </div>
                </div>

                {!sessionsQuery.data || sessionsQuery.data.length === 0 ? (
                    <div className='d-flex align-items-center justify-content-center'>
                        <p>No sessions found...</p>
                    </div>
                ) : (
                    <div className='pt-1'>
                        <Row>
                            <Col md={!sessionGuid ? 12 : 3}>

                                <Row>
                                    <section>
                                        <h4>Active Sessions</h4>
                                        <Row>
                                            <Col md={!sessionGuid ? 3 : 12} className='p-0'>
                                                <Form.Control
                                                    type='text'
                                                    className='border-bottom-0'
                                                    placeholder='Filter sessions...'
                                                    value={searchTerm}
                                                    onChange={(e) => handleSearchTermChange(e.target.value)}
                                                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                                                />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Table
                                                columns={columns}
                                                dataset={sessionsQuery.data
                                                    .filter(session => session.name.toLocaleLowerCase().includes(searchTerm))
                                                    .filter(session => (session.firstSessionDate.isBefore(LocalDate.now()) && session.lastSessionDate.isAfter(LocalDate.now()))
                                                        || session.firstSessionDate.equals(LocalDate.now()) || session.lastSessionDate.equals(LocalDate.now()))
                                                }
                                                defaultSort={{ index: 0, direction: SortDirection.Ascending }}
                                                rowProps={{ key: 'sessionGuid', onClick: rowClick }}
                                            />
                                        </Row>
                                    </section>

                                    <section>
                                        <h4>Finished Sessions</h4>
                                        <Table
                                            columns={columns}
                                            dataset={sessionsQuery.data
                                                .filter(session => session.name.toLocaleLowerCase().includes(searchTerm))
                                                .filter(session => session.lastSessionDate.isBefore(LocalDate.now()))
                                            }
                                            defaultSort={{ index: 0, direction: SortDirection.Ascending }}
                                            rowProps={{ key: 'sessionGuid', onClick: rowClick }}
                                        />
                                    </section>

                                    <section>
                                        <h4>Pending Sessions</h4>
                                        <Table
                                            columns={columns}
                                            dataset={sessionsQuery.data
                                                .filter(session => session.name.toLocaleLowerCase().includes(searchTerm))
                                                .filter(session => session.firstSessionDate.isAfter(LocalDate.now()))
                                            }
                                            defaultSort={{ index: 0, direction: SortDirection.Ascending }}
                                            rowProps={{ key: 'sessionGuid', onClick: rowClick }}
                                        />
                                    </section>
                                </Row>
                            </Col>
                            <Col md={!sessionGuid ? 0 : 9}>
                                {sessionGuid && <SessionDetails sessionGuid={sessionGuid} user={user} />}
                            </Col>
                        </Row>
                    </div>
                )}
            </Container>

            <Card>
                <Card.Header className='d-flex justify-content-center'>
                    <h3>Tools</h3>
                </Card.Header>
                <Card.Body>
                    <div className='row'>
                        <div>Add Instructor to Sessions</div>
                        <RegisterInstructor sessions={sessionsQuery.data || []} instructors={instructorsQuery.data || []} />
                    </div>

                    <hr />

                    <div className='row'>
                        Copy Registrations:
                        <CopyRegistrations state={sessionsQuery.data!} />
                    </div>
                </Card.Body>
            </Card>
        </>
    )
}

function dropdownOptionTransform(value: DropdownOption): string {
    return value.label
}

const createColumns = (missingAttendanceRecords, openSessionGuid): Column[] => [
    {
        label: 'Name',
        attributeKey: '',
        transform: (session: SimpleSessionView) => {

            if (session.sessionGuid === openSessionGuid)
                var textColorClass = 'text-primary'
            else if (missingAttendanceRecords.some(x => x.sessionGuid === session.sessionGuid))
                var textColorClass = 'text-danger'
            else
                var textColorClass = ''

            return (
                <div className={`${textColorClass}`}>{session.name}</div>
            )
        },
        sortable: true,
        sortTransform: (session: SimpleSessionView) => session.name
    },
    {
        label: 'Activity',
        attributeKey: 'activity',
        sortable: true,
        transform: dropdownOptionTransform
    },
    {
        label: 'Session Type',
        attributeKey: 'sessionType',
        sortable: true,
        transform: dropdownOptionTransform
    },
    {
        label: 'Schedule',
        attributeKey: '',
        sortable: true,
        transform: (session: SimpleSessionView) => {
            if (!session.daySchedules || session.daySchedules.length === 0)
                return 'No Schedule'

            let daysOfWeek = session.daySchedules.map(day => day.dayOfWeek).sort().map((dayOfWeek, index) =>
                index !== session.daySchedules.length - 1
                    ? `${DayOfWeek.toChar(dayOfWeek)}, `
                    : DayOfWeek.toChar(dayOfWeek)
            )

            return daysOfWeek
        }
    },
    {
        label: '',
        attributeKey: 'sessionGuid',
        sortable: false,
        transform: (value: string) => (
            <div className='d-flex justify-content-center'>
                <Button className='' size='sm'>
                    <Link to={value} style={{ color: 'inherit' }}>
                        View
                    </Link>
                </Button>
            </div>
        )
    }
]