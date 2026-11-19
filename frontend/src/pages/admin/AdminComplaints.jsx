import ComplaintList from '../../components/common/ComplaintList'

export default function AdminComplaints() {
  return (
    <ComplaintList
      endpoint="/complaints/admin"
      title="Complaint Management"
      subtitle="Review all submitted complaints, view complainant identities, and remove complaints when necessary."
      adminMode
      showAdminNote
    />
  )
}
