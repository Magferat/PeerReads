import { useEffect, useState } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import api from '../lib/api';
import ApproveModal from './ApproveModal';

// export default function MyLoans() {
//     const [data, setData] = useState({ borrowed: [], lent: [] });

//     const load = async () => {
//         const { data } = await api.get('/loans/mine');
//         setData(data);
//     };
//     useEffect(() => { load(); }, []);

//     const mark = async (path, loanId) => {
//         console.log("clicked", path)
//         await api.post(`/loans/${path}`, { loanId });
//         // await load();
//     };

//     const requestReturn = async (loanId) => {
//         try {
//             await api.post(`/loans/request-return`, { loanId });
//             await load();
//         } catch (e) {
//             alert(e.response?.data?.message || 'Cannot request yet');
//         }
//     }

//     return (
//         <Row className="g-3">
//             <Col md={6}>
//                 <h5>Lent</h5>
//                 {data.lent.map(l => (
//                     <Card className="p-3 mb-2" key={l._id}>
//                         <div><b>{l.book?.title}</b> • Status: {l.delivery?.status} / {l.status}</div>
//                         <div>Deposit: {l.depositHold}</div>
//                         <div className="mt-2 d-flex gap-2">


//                             <Button size="sm" onClick={() => mark('on-delivery', l._id)}>Mark On Delivery</Button>
//                             <Button size="sm" onClick={() => requestReturn(l._id)}>Request Return</Button>
//                             <Button size="sm" onClick={() => mark('return-ok', l._id)}>Confirm Return OK</Button>
//                         </div>
//                     </Card>
//                 ))}
//             </Col>
//             <Col md={6}>
//                 <h5>Borrowed</h5>
//                 {data.borrowed.map(l => (
//                     <Card className="p-3 mb-2" key={l._id}>
//                         <div><b>{l.book?.title}</b> • Status: {l.delivery?.status} / {l.status}</div>
//                         <div className="mt-2 d-flex gap-2">
//                             <Button size="sm" onClick={() => mark('at-borrower', l._id)}>I Received It</Button>
//                         </div>
//                     </Card>
//                 ))}
//             </Col>
//         </Row>
//     );
// }
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
    };

    const requestReturn = async (loanId) => {
        try {
            await api.post(`/loans/request-return`, { loanId });
            load();
        } catch (e) {
            alert(e.response?.data?.message || 'Cannot request yet');
        }
    };

    // pick which section to render
    const loans = section === "borrowed" ? data.borrowed : data.lent;
    const [showSchedule, setShowSchedule] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);

    const openScheduleReturn = (loanId) => {
        setSelectedLoan(loanId);
        setShowSchedule(true);
    };


    return (
        <div>
            {loans.length === 0 && <p>No {section} loans yet.</p>}
            {loans.map(l => (
                <Card className="p-3 mb-2" key={l._id}>
                    <div><b>{l.book?.title}</b> • Status: {l.delivery?.status}
                        {/* / {l.status} */}
                    </div>
                    {section === "lent" && (
                        // <div className="mt-2 d-flex gap-2">
                        //     {l.delivery?.status === "Pre-Delivery" && (
                        //         <Button size="sm" onClick={() => mark("on-delivery", l._id)}>Mark On Delivery</Button>
                        //     )}
                        //     {l.delivery?.status === "At Borrower" && (
                        //         <Button size="sm" onClick={() => requestReturn(l._id)}>Request Return</Button>
                        //     )}
                        //     {l.delivery?.status === "Return Scheduled" && (
                        //         <Button size="sm" onClick={() => mark("return-ok", l._id)}>Confirm Return OK</Button>
                        //     )}
                        // </div>
                        <div className="mt-2 d-flex gap-2">
                            {console.log(l)}
                            {l.delivery?.status === "Pre-Delivery" && (
                                <Button size="sm" onClick={() => mark("on-delivery", l._id)}>Mark On Delivery</Button>
                            )}
                            {l.delivery?.status === "At Borrower" && (
                                <Button size="sm" onClick={() => requestReturn(l._id)}>Requested Return</Button>
                            )}
                            {/* <Button size="sm" variant="success" onClick={() => mark('confirm-ok', l._id)}>Confirm OK</Button> */}
                            {l.delivery?.status === "Return Scheduled" && (
                                // <Button size="sm" onClick={() => mark("return-ok", l._id)}>Confirm Return OK</Button>
                                <div className="mt-2 d-flex gap-2">
                                    <Button size="sm" variant="success" onClick={() => mark('confirm-ok', l._id)}>Confirm OK</Button>
                                    <Button size="sm" variant="danger" onClick={() => mark('report-damage', l._id)}>Report Damage</Button>
                                </div>
                            )}
                        </div>
                    )}

                    {section === "borrowed" && (

                        <div className="mt-2 d-flex gap-2">
                            {l.delivery?.status === "On Delivery" && (
                                <Button size="sm" onClick={() => mark("at-borrower", l._id)}>I Received It</Button>
                            )}
                            {/* {l.delivery?.status === "On Delivery" && (
                                <Button size="sm" onClick={() => mark("received", l._id)}>I Received It</Button>
                            )} */}
                            {/* {l.delivery?.status === "At Borrower" && (
                                <>
                                    <Button size="sm" variant="success" onClick={() => mark("confirm-ok", l._id)}>Everything OK</Button>
                                    <Button size="sm" variant="danger" onClick={() => mark("report-damage", l._id)}>Report Damage</Button>
                                </>
                            )} */}
                            {l.delivery?.status === "At Borrower" && (
                                <Button size="sm" onClick={() => openScheduleReturn(l._id)}>Schedule Return</Button>
                            )}

                            {/* {l.delivery?.status === "Return Requested" && (
                                <Button size="sm" onClick={() => openScheduleReturn(l._id)}>Schedule Return</Button>
                            )} */}
                        </div>
                    )}

                </Card>
            ))}
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

        </div>
    );
}
