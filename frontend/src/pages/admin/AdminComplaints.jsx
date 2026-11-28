import ComplaintList from '../../components/common/ComplaintList'

export default function AdminComplaints() {
  return (
    <ComplaintList
      endpoint="/complaints/admin"
      title="Complaint Management"
      subtitle="Review submitted complaints, verify complainant details, and manage reported issues."
      adminMode
      showAdminNote
    />
  )
}