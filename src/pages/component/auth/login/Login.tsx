import { useState } from "react";
import { fetchUsers, loginUser } from "../../../../service/service";
import { Link, useNavigate } from "react-router-dom";
import * as yup from 'yup';
import './Login.css';
// import '../../../../index.css'
interface ILoginModel {
    email: string;
    password: string
}

const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const Login = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<ILoginModel>({ email: "", password: "" })
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = event.target.id;
        const value = event.target.value;
        setData({ ...data, [id]: value });
        // Remove validation error for this field as user types
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[id];
          return newErrors;
        });
    }

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            await loginSchema.validate(data, { abortEarly: false });
            setFormErrors({});
            const updatedUser = await loginUser(data);
            localStorage.setItem('token', (updatedUser.access_token));
            setData({
                ...data,
                email: '',
                password: ''
            });
            const getUserProfile = await fetchUsers();
            localStorage.setItem('role', getUserProfile.role);
            navigate("/dashboard/home");
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                const errors: { [key: string]: string } = {};
                error.inner.forEach((err: any) => {
                    if (err.path) errors[err.path] = err.message;
                });
                setFormErrors(errors);
            }
        }
    }
    return (
        <>
            <div className="background">
                <div className="shape"></div>
                <div className="shape"></div>
            </div>
            <form className="form" onSubmit={handleFormSubmit}>
                <h3>Login Here</h3>

                <label >Email:</label>
                <input
                  type="text"
                  placeholder="Enter Email"
                  id="email"
                  value={data.email}
                  onChange={handleInputChange}
                  style={formErrors.email ? { border: '1px solid red' } : {}}
                />
                {formErrors.email && <div style={{ color: 'red', fontSize: '0.9em' }}>{formErrors.email}</div>}
                <label >Password:</label>
                <input
                  type="password"
                  placeholder="Enter Password"
                  id="password"
                  value={data.password}
                  onChange={handleInputChange}
                  style={formErrors.password ? { border: '1px solid red' } : {}}
                />
                {formErrors.password && <div style={{ color: 'red', fontSize: '0.9em' }}>{formErrors.password}</div>}
                <div className="commonBtn">
                    <button className="btn">Log In</button>
                </div>
                {/* <div className="social">
                    <Link to="/signup">Sign Up </Link>
                </div> */}
                  <div className="auth-footer">
                    Create new account? <Link to="/signup" className="auth-link">Sign Up</Link>
                </div>

            </form>
        </>
    )
}

export default Login


