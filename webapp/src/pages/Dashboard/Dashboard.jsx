import Sidebar from "../../components/Leftsidebar/Leftsidebar";
import { getTotalUsers, getOrderStats } from "../../services/authServices";
import "./Dashboard.css";
import { FaUsers, FaBoxOpen, FaClock, FaCircleCheck, FaCheckDouble, FaCircleXmark } from "react-icons/fa6";
import { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

function Dashboard() {

    const [totalUsers, setTotalUsers] = useState(0);
    const [orderStats, setOrderStats] = useState(0);
        

    const userData = [
        { month: "Jan", users: 10 },
        { month: "Feb", users: 20 },
        { month: "Mar", users: 30 },
        { month: "Apr", users: 40 },
        { month: "May", users: 50 },
        { month: "Jun", users: 60 },
        { month: "Jul", users: 100 },
    ];
    useEffect(() => {
        const fetchTotalUsers = async () => {
            try {
                const data = await getTotalUsers();
                setTotalUsers(data.totalUsers);
            } catch (error) {
                console.error("Error fetching total users:", error);
            }
        };
        const fetchOrderStats = async () => {
            try {
                const data = await getOrderStats();
                setOrderStats({
                    totalOrders:     data.totalOrders,
                    pendingOrders:   data.pendingOrders,
                    confirmedOrders: data.confirmedOrders,
                    completedOrders: data.completedOrders,
                    cancelledOrders: data.cancelledOrders
                });
            } catch (error) {
                console.error("Error fetching order stats:", error);
            }
        };
        fetchTotalUsers();
        fetchOrderStats();
    }, []);


    return (
        <div className="dashboard">

            {/* Sidebar */}

            <Sidebar />


            {/* Main Content */}

            <main className="dashboard-content">

                <div className="dashboard-body">

                    <div className="dashboard-header">
                        <h1>Hello Admin</h1>
                        <div className="dashboard-clock">
                            <iframe
                                title="Live Clock"
                                src="https://free.timeanddate.com/clock/iak6lp85/n423/szw120/szh120/hoc09f/hbw20/hfc09f/cf100/hnce1ead6/hwcf00/hccf00/hcw2/fas30/fdi66/mqc000/mql15/mqw4/mqd98/mhc000/mhl15/mhw4/mhd98/mmc000/mml10/mmw1/mmd98/hhs2/hms2"
                                frameBorder="0"
                                width="120"
                                height="120"
                            />
                        </div>
                    </div>


                    {/* Dashboard Cards */}

                    <div className="dashboard-cards">

                        <div className="dashboard-card card-blue">
                            <div className="card-icon-wrap">
                                <FaUsers className="card-icon" />
                            </div>
                            <div className="card-info">
                                <p className="card-value">{totalUsers}</p>
                                <h3 className="card-label">Total Users</h3>
                            </div>
                        </div>

                        <div className="dashboard-card card-purple">
                            <div className="card-icon-wrap">
                                <FaBoxOpen className="card-icon" />
                            </div>
                            <div className="card-info">
                                <p className="card-value">{orderStats.totalOrders}</p>
                                <h3 className="card-label">Total Orders</h3>
                            </div>
                        </div>

                        <div className="dashboard-card card-yellow">
                            <div className="card-icon-wrap">
                                <FaClock className="card-icon" />
                            </div>
                            <div className="card-info">
                                <p className="card-value">{orderStats.pendingOrders}</p>
                                <h3 className="card-label">Pending</h3>
                            </div>
                        </div>

                        <div className="dashboard-card card-cyan">
                            <div className="card-icon-wrap">
                                <FaCircleCheck className="card-icon" />
                            </div>
                            <div className="card-info">
                                <p className="card-value">{orderStats.confirmedOrders}</p>
                                <h3 className="card-label">Confirmed</h3>
                            </div>
                        </div>

                        <div className="dashboard-card card-green">
                            <div className="card-icon-wrap">
                                <FaCheckDouble className="card-icon" />
                            </div>
                            <div className="card-info">
                                <p className="card-value">{orderStats.completedOrders}</p>
                                <h3 className="card-label">Completed</h3>
                            </div>
                        </div>

                        <div className="dashboard-card card-red">
                            <div className="card-icon-wrap">
                                <FaCircleXmark className="card-icon" />
                            </div>
                            <div className="card-info">
                                <p className="card-value">{orderStats.cancelledOrders}</p>
                                <h3 className="card-label">Cancelled</h3>
                            </div>
                        </div>

                    </div>



                    

                     {/* User Chart */}

                    <div className="user-chart">

                        <h2>User Growth</h2>

                        <ResponsiveContainer
                            width="100%"
                            height={250}
                        >
                            <LineChart data={userData}>

                                <CartesianGrid strokeDasharray="3 3" />

                                <XAxis dataKey="month" />

                                <YAxis />

                                <Tooltip />

                                <Line
                                    type="monotone"
                                    dataKey="users"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                />

                            </LineChart>
                        </ResponsiveContainer>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default Dashboard;