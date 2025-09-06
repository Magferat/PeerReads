// // src/admin/UserActivity.jsx
// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Table, Button, Card } from "react-bootstrap";
// import api from "../lib/api";

// export default function UserActivity() {
//     const { id } = useParams(); // from route /admin/users/:id/activity
//     const navigate = useNavigate();
//     const [data, setData] = useState(null);

//     useEffect(() => {
//         const load = async () => {
//             try {
//                 const res = await api.get(`/admin/users/${id}/activity`);
//                 setData(res.data);
//             } catch (err) {
//                 console.error(err);
//                 alert("Failed to load user activity");
//             }
//         };
//         load();
//     }, [id]);

//     if (!data) return <p>Loading...</p>;

//     const { user, borrowed, lent } = data;
//     console.log("User : ", user);
//     console.log("Borrowed : ", borrowed);
//     console.log("Lent : ", lent);

//     return (
//         <div className="p-3">
//             <Card className="mb-3 p-3">
//                 <h5>User Info</h5>
//                 <p><b>ID:</b> {user._id}</p>
//                 <p><b>Name:</b> {user.name}</p>
//                 <p><b>Email:</b> {user.email}</p>
//                 <p><b>Role:</b> {user.role}</p>
//                 <p><b>Balance:</b> {user.balance}</p>
//                 <p><b>Locked Balance:</b> {user.lockedBalance}</p>
//                 <p><b>Address:</b> {user.address || "N/A"}</p>
//             </Card>

//             <h5>Borrowed Loans</h5>
//             <Table striped bordered size="sm" className="mb-4">
//                 <thead>
//                     <tr>
//                         <th>Book</th>
//                         <th>Lender</th>
//                         <th>Status</th>
//                         <th>Delivery Status</th>
//                         {/* <th>Delivery Timeline</th> */}
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {borrowed.map((loan) => (
//                         <tr key={loan._id}>
//                             <td>{loan.book?.title}</td>
//                             <td>{loan.lender?.name} ({loan.lender?.email})</td>
//                             <td>{loan.status}</td>
//                             <td>{loan.delivery?.status}</td>
//                             {/* {console.log(loan.delivery?.timeline)} */}
//                             {/* <td>{loan.delivery?.timeline}</td> */}
//                         </tr>
//                     ))}
//                 </tbody>
//             </Table>


//             <h5>Lent Loans</h5>
//             <Table striped bordered size="sm">
//                 <thead>
//                     <tr>
//                         <th>Book</th>
//                         <th>Borrower</th>
//                         <th>Status</th>
//                         <th>Delivery Status</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {lent.map((loan) => (
//                         <tr key={loan._id}>
//                             <td>{loan.book?.title}</td>
//                             <td>{loan.borrower?.name} ({loan.borrower?.email})</td>
//                             <td>{loan.status}</td>
//                             <td>{loan.delivery?.status}</td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </Table>

//             <Button variant="secondary" onClick={() => navigate(-1)}>
//                 Go Back
//             </Button>
//         </div>
//     );
// }
// src/admin/UserActivity.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button } from "react-bootstrap";
import api from "../lib/api";
import LoanTable from "./LoanTable"; // 👈 import the reusable table with timeline

export default function UserActivity() {
    const { id } = useParams(); // from route /admin/users/:id/activity
    const navigate = useNavigate();
    const [data, setData] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get(`/admin/users/${id}/activity`);
                setData(res.data);
            } catch (err) {
                console.error(err);
                alert("Failed to load user activity");
            }
        };
        load();
    }, [id]);

    if (!data) return <p>Loading...</p>;

    const { user, borrowed, lent } = data;

    return (
        <div className="p-3">
            <Card className="mb-3 p-3">
                <h5>User Info</h5>
                <p><b>ID:</b> {user._id}</p>
                <p><b>Name:</b> {user.name}</p>
                <p><b>Email:</b> {user.email}</p>
                <p><b>Role:</b> {user.role}</p>
                <p><b>Balance:</b> {user.balance}</p>
                <p><b>Locked Balance:</b> {user.lockedBalance}</p>
                <p><b>Address:</b> {user.location?.address || "N/A"}</p>
            </Card>

            <h5>Borrowed Loans</h5>
            <LoanTable loans={borrowed} type="borrowed" /> {/* ✅ with timeline */}

            <h5>Lent Loans</h5>
            <LoanTable loans={lent} type="lent" /> {/* ✅ with timeline */}

            <Button variant="secondary" onClick={() => navigate(-1)}>
                Go Back
            </Button>
        </div>
    );
}
