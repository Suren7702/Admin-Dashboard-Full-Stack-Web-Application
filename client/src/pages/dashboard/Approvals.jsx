import DashboardLayout from "../../layout/DashboardLayout.jsx";

export default function Approvals() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Approvals</h1>
      <p className="text-gray-400 text-sm">
        This page will show pending approvals for members, volunteers, and admins.
      </p>
    </DashboardLayout>
  );
}
