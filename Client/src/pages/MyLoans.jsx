// import { useEffect, useState } from 'react';
// import { Row, Col, Card, Button } from 'react-bootstrap';
// import api from '../lib/api';
// import ApproveModal from './ApproveModal';


// import ReportDamageModal from "./ReportDamageModal"; // ✅ import

// export default function MyLoans({ section }) {
//     const [data, setData] = useState({ borrowed: [], lent: [] });

//     const load = async () => {
//         const { data } = await api.get('/loans/mine');
//         setData(data);
//     };
//     useEffect(() => { load(); }, []);

//     const mark = async (path, loanId) => {
//         await api.post(`/loans/${path}`, { loanId });
//         load();
//     };

//     const requestReturn = async (loanId) => {
//         try {
//             await api.post(`/loans/request-return`, { loanId });
//             load();
//         } catch (e) {
//             alert(e.response?.data?.message || 'Cannot request yet');
//         }
//     };

//     const loans = section === "borrowed" ? data.borrowed : data.lent;
//     const [showSchedule, setShowSchedule] = useState(false);
//     const [selectedLoan, setSelectedLoan] = useState(null);

//     const [showReport, setShowReport] = useState(false); // for report modal

//     const openScheduleReturn = (loanId) => {
//         setSelectedLoan(loanId);
//         setShowSchedule(true);
//     };

//     const openReportDamage = (loanId) => {
//         setSelectedLoan(loanId);
//         setShowReport(true);
//     };

//     return (
//         <div>
//             {loans.length === 0 && <p>No {section} loans yet.</p>}
//             {loans.map(l => (
//                 <Card className="p-3 mb-2" key={l._id}>
//                     <div><b>{l.book?.title}</b> • Status: {l.delivery?.status}</div>
//                     {console.log("Dekhooo", l.delivery?.status)}

//                     {section === "lent" && (


//                         < div className="mt-2 d-flex gap-2">
//                             {console.log("labh hoy nai")}
//                             {l.delivery?.status === "Pre-Delivery" && (
//                                 <Button size="sm" onClick={() => mark("on-delivery", l._id)}>Mark On Delivery</Button>
//                             )}
//                             {l.delivery?.status === "At Borrower" && (
//                                 <Button size="sm" onClick={() => requestReturn(l._id)}>Request Return</Button>
//                             )}

//                             {l.delivery?.status === "Return Scheduled" && (
//                                 <div className="mt-2 d-flex gap-2">
//                                     {/* Show Confirm OK only if NOT disputed */}
//                                     {l.status !== "Disputed" && (
//                                         <Button
//                                             size="sm"
//                                             variant="success"
//                                             onClick={() => mark('confirm-ok', l._id)}
//                                         >
//                                             Confirm OK
//                                         </Button>
//                                     )}

//                                     <Button
//                                         size="sm"
//                                         variant="danger"
//                                         onClick={() => mark('report-damage', l._id)}
//                                         disabled={l.status === "Disputed"}   // disable if already disputed
//                                     >
//                                         {l.status === "Disputed" ? "Damage Reported" : "Report Damage"}
//                                     </Button>
//                                 </div>
//                             )}


//                         </div>
//                     )}

//                     {section === "borrowed" && (
//                         <div className="mt-2 d-flex gap-2">
//                             {l.delivery?.status === "On Delivery" && (
//                                 <Button size="sm" onClick={() => mark("at-borrower", l._id)}>I Received It</Button>
//                             )}
//                             {l.delivery?.status === "At Borrower" && (
//                                 <Button size="sm" onClick={() => openScheduleReturn(l._id)}>Schedule Return</Button>
//                             )}
//                         </div>
//                     )}
//                 </Card>
//             ))
//             }

//             {/* Schedule Return Modal */}
//             <ApproveModal
//                 show={showSchedule}
//                 onHide={() => setShowSchedule(false)}
//                 loanId={selectedLoan}
//                 apiPath="/loans/schedule-return"
//                 title="Schedule Return Date & Time"
//                 label="Return At:"
//                 successMsg="Return scheduled!"
//                 onApproved={load}
//             />

//             {/* Report Damage Modal */}
//             <ReportDamageModal
//                 show={showReport}
//                 onHide={() => setShowReport(false)}
//                 loanId={selectedLoan}
//                 onReported={load}
//             />
//         </div >
//     );
// }
import { useEffect, useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import api from '../lib/api';
import ApproveModal from './ApproveModal';
import ReportDamageModal from "./ReportDamageModal"; // ✅ import
import { toast } from 'react-toastify';


export default function MyLoans({ section }) {
    const [data, setData] = useState({ borrowed: [], lent: [] });

    const load = async () => {
        const { data } = await api.get('/loans/mine');
        setData(data);
    };
    useEffect(() => { load(); }, []);

    const mark = async (path, loanId) => {
        await api.post(`/loans/${path}`, { loanId });
        load();
        if (path === "not-returning") {
            {
                toast.success("Reported to Admin");
            }
        }
    };

    const requestReturn = async (loanId) => {
        try {
            await api.post(`/loans/request-return`, { loanId });
            toast.success("Return Request sent to borrower.");
            load();
        } catch (e) {
            alert(e.response?.data?.message || 'Cannot request yet');
        }
    };

    // ✅ filter out closed loans
    const rawLoans = section === "borrowed" ? data.borrowed : data.lent;
    const loans = rawLoans.filter(l => l.status !== "Closed");

    const [showSchedule, setShowSchedule] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);

    const [showReport, setShowReport] = useState(false); // report modal

    const openScheduleReturn = (loanId) => {
        setSelectedLoan(loanId);
        setShowSchedule(true);
    };

    const openReportDamage = (loanId) => {
        setSelectedLoan(loanId);
        setShowReport(true);
    };

    return (
        <div>
            {loans.length === 0 && <p>No Ongoing {section} loans.</p>}
            {loans.map(l => (
                <Card
                    className={`p-3 mb-2 ${l.status === "Disputed" ? "border border-danger" : ""}`}
                    key={l._id}
                >
                    <div>
                        <b>{l.book?.title}</b> • Status: {l.delivery?.status}
                        <br />

                        {/* {console.log(l)} */}
                    </div>

                    {section === "lent" && (
                        <>
                            <div> <p><b>Borrower:</b> {l.borrower?.name} <br />
                                <b>Email : </b> {l.borrower?.email} </p></div>
                            <div className=" d-flex gap-2">
                                {/* <div className="m-2"> */}
                                {/* <b>{l.book?.title}</b> • Status: {l.delivery?.status}
                                <br /> */}
                                {/* {console.log(l)} */}

                                {/* </div> */}


                                {l.delivery?.status === "Pre-Delivery" && (
                                    <Button size="sm" onClick={() => mark("on-delivery", l._id)}>
                                        Mark On Delivery
                                    </Button>
                                )}
                                {l.delivery?.status === "At Borrower" && l.status !== "Disputed" && (
                                    <Button size="sm" onClick={() => requestReturn(l._id)}
                                        disabled={l.status === "Return Requested"}>
                                        Request Return
                                    </Button>
                                )}
                                {l.delivery?.status === "At Borrower" && (
                                    <Button
                                        size="sm"
                                        variant="warning"
                                        onClick={() => mark("not-returning", l._id)}
                                        disabled={l.status === "Disputed"}
                                    >

                                        Not Returning
                                    </Button>
                                )}


                                {l.delivery?.status === "Return Scheduled" && (
                                    <div className="mt-2 d-flex gap-2">
                                        {/* Show Confirm OK only if NOT disputed */}
                                        {l.status !== "Disputed" && (
                                            <Button
                                                size="sm"
                                                variant="success"
                                                onClick={() => mark('confirm-ok', l._id)}
                                            >
                                                Confirm OK
                                            </Button>
                                        )}

                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => openReportDamage(l._id)} // ✅ open modal
                                            disabled={l.status === "Disputed"}   // disable if already disputed
                                        >
                                            {l.status === "Disputed" ? "Damage Reported" : "Report Damage"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </>)}

                    {section === "borrowed" && (
                        <>
                            <div>

                                <b>Lender:</b> {l.lender?.name} <br />

                                <b>Email : </b>{l.lender?.email}
                            </div>
                            <div className="mt-2 d-flex gap-2">




                                {l.delivery?.status === "On Delivery" && (
                                    <Button size="sm" onClick={() => mark("at-borrower", l._id)}>
                                        I Received It
                                    </Button>
                                )}
                                {l.delivery?.status === "At Borrower" && (
                                    <Button size="sm" onClick={() => openScheduleReturn(l._id)}>
                                        Schedule Return
                                    </Button>
                                )}
                            </div>
                        </>)}
                </Card>
            ))}

            {/* Schedule Return Modal */}
            <ApproveModal
                show={showSchedule}
                onHide={() => setShowSchedule(false)}
                loanId={selectedLoan}
                apiPath="/loans/schedule-return"
                title="Schedule Return Date & Time"
                label="Return At:"
                successMsg="Return scheduled!"
                onApproved={load}
            />

            {/* Report Damage Modal */}
            <ReportDamageModal
                show={showReport}
                onHide={() => setShowReport(false)}
                loanId={selectedLoan}
                onReported={load}
            />
        </div>
    );
}
