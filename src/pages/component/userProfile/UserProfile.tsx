import { useEffect, useState } from "react";
import { fetchUsers } from "../../../service/service";

const UserProfile = () => {
    const [userprofile, setUserProfile] = useState<any>()
    useEffect(() => {
        getUserProfiles();
    }, []);
    const getUserProfiles = async () => {
        try {
            const getUserProfile = await fetchUsers();
            localStorage.setItem('userprofile', getUserProfile)
            setUserProfile(getUserProfile);;

            console.log('getUserProfile', getUserProfile);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            // Handle error (e.g., show error message to user)
        }
    }

    return (
        <>
            <h1>this is user profile</h1>
            <button onClick={getUserProfiles}>Get User</button>
            <div className="userdetail">
                <p>Name:{userprofile?.name}</p>
                <p>Email:{userprofile?.email}</p>
                <p>Role:{userprofile?.role}</p>

            </div>
        </>
    )
}


export default UserProfile