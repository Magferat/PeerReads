import { useEffect, useState } from "react";
// import axios from "axios";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";

export default function Profile() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [lendingBooks, setLendingBooks] = useState([]);
    const [borrowingBooks, setBorrowingBooks] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ username: "", email: "", location: "" });

    useEffect(() => {
        async function fetchProfile() {
            try {
                let url = "";
                if (!id || id === "me") {
                    url = "/users/me";          // ✅ remove `/api` because baseURL already has it
                } else {
                    url = `/users/profile/${id}`;
                }

                const { data } = await api.get(url);  // ✅ use api
                const fetchedUser = data.user;

                setUser(fetchedUser);
                setLendingBooks(data.lendingBooks || []);
                // setBorrowingBooks(data.borrowingBooks || []);
                setFormData({
                    username: fetchedUser.username || "",
                    email: fetchedUser.email || "",
                    address: fetchedUser.location.address || "",
                    coords: fetchedUser.location.coords || "",

                });

            } catch (err) {
                console.error("Failed to fetch profile:", err);
            }
        }
        fetchProfile();
        async function fetchLoans() {
            try {
                let url = "loans/mine";

                const { data } = await api.get(url);
                console.log(data, data.borrowed)
                // setLendingBooks(data.lent || []);

                setBorrowingBooks(data.borrowed || []);

                // console.log(lendingBooks, borrowingBooks);


            }
            catch (err) {
                console.error("Failed to fetch loans:", err);


            }


        }
        fetchLoans();
    }, [id]);



    const handleUpdate = async () => {
        try {
            // console.log(formData)

            const { data } = await api.put("/users/me", {
                username: formData.username,
                email: formData.email,
                address: formData.address,
                coords: formData.coords,
            });
            setUser(data.user);

            setEditMode(false); // back to view mode
        } catch (err) {
            console.error("Update failed:", err);
        }
    };


    const getLiveLocation = () => {
        // console.log("clickedddd")
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;


                try {
                    // Convert lat/lng to human-readable address
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
                    );
                    // console.log("here")

                    const data = await res.json();
                    // console.log(data.address)
                    const newLocation = {
                        address: data.display_name, // readable address
                        coords: { lat, lng },
                    };
                    setFormData({ ...formData, address: newLocation.address, coords: newLocation.coords });
                } catch (err) {
                    console.error("Failed to fetch address:", err);
                    setFormData({ ...formData, location: { coords: { lat, lng } } });
                }
            });
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    };



    if (!user) return <div className="container mt-4">Loading...</div>;

    const isMe = user?._id;

    // console.log(isMe, user._id)

    return (
        <div className="container mt-4">
            {/* <h2>{isMe ? "My Profile" : `${user.username}'s Profile`}</h2> */}


            <h2>{isMe ? "My Profile" : `${user.name}'s Profile`}</h2>

            {isMe && editMode ? (
                <>
                    <input
                        type="text"
                        className="form-control mb-2"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                    <input
                        type="email"
                        // placeholder=""
                        className="form-control mb-2"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <div className="input-group mb-2">
                        <input
                            type="text"
                            className="form-control"
                            // placeholder="Enter your Address"
                            value={formData.address}
                            readOnly
                        />
                        <button className="btn btn-secondary" onClick={getLiveLocation}>
                            Get Live Location
                        </button>
                    </div>
                    <button className="btn btn-primary me-2" onClick={handleUpdate}>
                        Save
                    </button>
                    <button className="btn btn-warning" onClick={() => setEditMode(false)}>
                        Cancel
                    </button>
                </>
            ) : (
                <>
                    <p>
                        <strong>Name:</strong> {user.name}
                    </p>
                    <p>
                        <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                        <strong>Role:</strong> {user.role}
                    </p>
                    <p>
                        <strong>Credit:</strong> {user.balance}
                    </p>
                    {/* <p>
                        <strong>Credit:</strong> {user.balance}
                    </p> */}
                    <p><strong>Address:</strong> {user.location?.address || "Not set"}</p>

                    {isMe && (
                        <button className="btn btn-primary" onClick={() => setEditMode(true)}>
                            Edit Profile
                        </button>

                    )}
                    {/* <button > <Link to="/recharge">Recharge</Link></button> */}
                </>
            )}


            <div className="card p-3 my-3">
                <h4>Lending Books</h4>
                <ul className="list-group">
                    {lendingBooks.map((b) => (
                        <li key={b._id} className="list-group-item">
                            <strong> {b.title} </strong> by {b.author}
                            <strong className="ps-3">Status : </strong>{b.status}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="card p-3 my-3">
                <h4>Borrowing Books</h4>
                <ul className="list-group">
                    {borrowingBooks.map((b) => (
                        <li key={b.book._id} className="list-group-item">
                            <strong>{b.book.title}</strong> by {b.book.author}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
