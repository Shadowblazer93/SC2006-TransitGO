import React, { useEffect, useState } from 'react';
import { getUsers } from '../services/api';

const UserComponent = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getUserData = async () => {
            try {
                const data = await getUsers();
                setUser(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getUserData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            {user ? (
                <div>
                    <h1>{user.name}</h1>
                    <p>Email: {user.email}</p>
                    <p>Username: {user.username}</p>
                </div>
            ) : (
                <div>No user data available</div>
            )}
        </div>
    );
};

export default UserComponent;