import { useOutletContext } from "react-router-dom";
import DashboardTab from "../../components/admin/DashboardTab";

const DashboardPage = () => {
  const { stats, orders } = useOutletContext();

  return <DashboardTab stats={stats} orders={orders} />;
};

export default DashboardPage;

