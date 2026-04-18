import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../context/store'
import { supervisorService } from '../services/supervisorService'
import { requestService } from '../services/requestService'
import { Container, Section, Grid } from '../components/Layout'
import { SupervisorCard } from '../components/SupervisorCard'
import { Input, Select } from '../components/FormInputs'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Alert } from '../components/Alert'
import { Search } from 'lucide-react'

export const StudentSupervisorsPage = () => {
    const { user } = useAuthStore()
    const [supervisors, setSupervisors] = useState([])
    const [filteredSupervisors, setFilteredSupervisors] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedDepartment, setSelectedDepartment] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [requestStatuses, setRequestStatuses] = useState({})

    const departments = ['CS', 'SE', 'IT', 'AI', 'DS']

    useEffect(() => {
        fetchSupervisors()
    }, [])

    useEffect(() => {
        filterSupervisors()
    }, [supervisors, searchTerm, selectedDepartment])

    const fetchSupervisors = async () => {
        setLoading(true)
        try {
            const result = await supervisorService.getSupervisors()
            if (result.success) {
                setSupervisors(result.data)

                // Check existing request statuses
                const statuses = {}
                for (const supervisor of result.data) {
                    const statusResult = await requestService.getRequestStatus(user.id, supervisor.id)
                    if (statusResult.data) {
                        statuses[supervisor.id] = statusResult.data.status
                    }
                }
                setRequestStatuses(statuses)
                setError(null)
            } else {
                setError(result.error)
            }
        } catch (err) {
            setError('Failed to load supervisors')
        } finally {
            setLoading(false)
        }
    }

    const filterSupervisors = () => {
        let filtered = supervisors

        if (selectedDepartment) {
            filtered = filtered.filter((s) => s.department === selectedDepartment)
        }

        if (searchTerm) {
            filtered = filtered.filter((s) =>
                s.user_profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.research_area.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        setFilteredSupervisors(filtered)
    }

    const handleRequest = async (supervisorId) => {
        try {
            const result = await requestService.sendRequest(user.id, supervisorId)

            if (result.success) {
                setRequestStatuses({
                    ...requestStatuses,
                    [supervisorId]: 'pending',
                })
                setSuccessMessage('Request sent successfully!')
                setTimeout(() => setSuccessMessage(''), 3000)
            } else {
                setError(result.error)
            }
        } catch (err) {
            setError('Failed to send request')
        }
    }

    if (loading) return <LoadingSpinner fullPage />

    return (
        <div className="min-h-screen bg-gray-50">
            <Container className="py-8">
                <Section
                    title="Find Your Supervisor"
                    subtitle="Browse supervisor profiles and send requests"
                >
                    {error && (
                        <div className="mb-6">
                            <Alert type="error" message={error} onClose={() => setError(null)} />
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-6">
                            <Alert type="success" message={successMessage} />
                        </div>
                    )}

                    {/* Search and Filter */}
                    <div className="mb-8 space-y-4 md:flex gap-4 md:space-y-0">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search supervisors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-500 outline-none"
                            />
                        </div>

                        <Select
                            options={[
                                { label: 'All Departments', value: '' },
                                ...departments.map((dept) => ({ label: dept, value: dept })),
                            ]}
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="w-full md:w-48"
                        />
                    </div>

                    {/* Supervisors Grid */}
                    {filteredSupervisors.length > 0 ? (
                        <Grid columns={3}>
                            {filteredSupervisors.map((supervisor) => (
                                <SupervisorCard
                                    key={supervisor.id}
                                    supervisor={supervisor}
                                    onRequest={() => handleRequest(supervisor.id)}
                                />
                            ))}
                        </Grid>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No supervisors found</p>
                        </div>
                    )}
                </Section>
            </Container>
        </div>
    )
}
