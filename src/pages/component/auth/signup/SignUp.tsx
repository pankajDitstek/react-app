import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import './SignUp.css';
import api from "../../../../interceptor/interceptor";
import * as yup from "yup";

export interface IUserModel {
    email: string;
    name: string;
    password: string;
    role: "customer" | "admin";
    avatar: string;
}

const staticAvatars = [
    'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    'https://cdn-icons-png.flaticon.com/512/921/921071.png',
    'https://cdn-icons-png.flaticon.com/512/194/194938.png',
    'https://cdn-icons-png.flaticon.com/512/706/706830.png',
    'https://cdn-icons-png.flaticon.com/512/4333/4333609.png'
];

const schema = yup.object({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Enter a valid email").required("Email is required"),
    password: yup.string().min(6, "Password should be at least 6 characters").required("Password is required"),
    role: yup.string().oneOf(["customer", "admin"], "Select a valid role").required("Role is required"),
    avatar: yup.string().url("Avatar must be a valid URL").required("Avatar is required"),
});

const SignUp = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<IUserModel>({
        email: "",
        name: "",
        password: "",
        role: "customer",
        avatar: staticAvatars[0],
    });
    const [message, setMessage] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [customAvatarUrl, setCustomAvatarUrl] = useState<string>("");
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof IUserModel, string>>>({});

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = event.target;
        setData(prev => ({ ...prev, [id]: value }));
        setMessage("");
        setFieldErrors({ ...fieldErrors, [id]: undefined });
    };

    const handleAvatarSelect = (avatarUrl: string) => {
        setData(prev => ({ ...prev, avatar: avatarUrl }));
        setCustomAvatarUrl("");
        setMessage("");
        setFieldErrors({ ...fieldErrors, avatar: undefined });
    };

    const handleCustomAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setCustomAvatarUrl(url);
        setData(prev => ({ ...prev, avatar: url }));
        setMessage("");
        setFieldErrors({ ...fieldErrors, avatar: undefined });
    };

    const validateForm = async () => {
        try {
            await schema.validate(data, { abortEarly: false });
            setFieldErrors({});
            return true;
        } catch (err: any) {
            if (err.inner) {
                const errors: Partial<Record<keyof IUserModel, string>> = {};
                err.inner.forEach((validationError: any) => {
                    if (validationError.path) {
                        errors[validationError.path as keyof IUserModel] = validationError.message;
                    }
                });
                setFieldErrors(errors);
            }
            return false;
        }
    };

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage("");
        const isValid = await validateForm();
        if (!isValid) return;
        setIsSubmitting(true);
        try {
            const response = await api.post('/users', data);
            if (response.status === 201) {
                setMessage("Registration successful! Redirecting to login...");
                setData({
                    email: "",
                    name: "",
                    password: "",
                    role: "customer",
                    avatar: staticAvatars[0],
                });
                setCustomAvatarUrl("");
                setTimeout(() => navigate('/'), 2000);
            }
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message || "Registration failed. Please try again."
                : "An unexpected error occurred";
            setMessage(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="background">
                    <div className="shape"></div>
                    <div className="shape"></div>
                </div>
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleFormSubmit} noValidate>
                <h3>Register Here</h3>
                <div className="avatar-section">
                    {/* <div className="avatar-preview">
                        <img
                            src={data.avatar}
                            alt="Avatar Preview"
                            className="avatar-image"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = staticAvatars[0];
                                setData(prev => ({ ...prev, avatar: staticAvatars[0] }));
                            }}
                        />
                    </div> */}
                    <div className="avatar-options">
                        <h4>Choose Avatar:</h4>
                        <div className="static-avatars">
                            {staticAvatars.map((avatar, index) => (
                                <img
                                    key={index}
                                    src={avatar}
                                    alt={`Avatar ${index + 1}`}
                                    className={`avatar-option ${data.avatar === avatar ? 'selected' : ''}`}
                                    onClick={() => handleAvatarSelect(avatar)}
                                    style={{ border: data.avatar === avatar ? '2px solid #007bff' : 'none' }}
                                />
                            ))}
                        </div>
                        <div className="custom-avatar-url">
                            <label htmlFor="avatar-url">Or enter avatar URL:</label>
                            <input
                                type="url"
                                id="avatar"
                                placeholder="https://example.com/avatar.jpg"
                                value={customAvatarUrl}
                                onChange={handleCustomAvatarChange}
                                className={`url-input${fieldErrors.avatar ? ' error' : ''}`}
                            />
                            {fieldErrors.avatar && <span className="error-message">{fieldErrors.avatar}</span>}
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        placeholder="Enter name"
                        id="name"
                        value={data.name}
                        onChange={handleInputChange}
                        className={fieldErrors.name ? 'error' : ''}
                    />
                    {fieldErrors.name && <span className="error-message">{fieldErrors.name}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        placeholder="Enter email"
                        id="email"
                        value={data.email}
                        onChange={handleInputChange}
                        className={fieldErrors.email ? 'error' : ''}
                    />
                    {fieldErrors.email && <span className="error-message">{fieldErrors.email}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        placeholder="Password (min 6 characters)"
                        id="password"
                        value={data.password}
                        onChange={handleInputChange}
                        className={fieldErrors.password ? 'error' : ''}
                    />
                    {fieldErrors.password && <span className="error-message">{fieldErrors.password}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="role">Account Type</label>
                    <select
                        id="role"
                        value={data.role}
                        onChange={handleInputChange}
                        className={fieldErrors.role ? 'error role-select' : 'role-select'}
                    >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                    </select>
                    {fieldErrors.role && <span className="error-message">{fieldErrors.role}</span>}
                </div>
                {message && (
                    <div className={`message ${message.includes("success") ? "success" : "error"}`}>
                        {message}
                    </div>
                )}
                <button
                    type="submit"
                    className="auth-btn"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Registering..." : "Register"}
                </button>
                <div className="auth-footer account-link">
                    Already have an account? <Link to="/" className="auth-link">Login</Link>
                </div>
            </form>
        </div>
    </>
    );
};

export default SignUp;