import { useState, useEffect } from "react";
import logo from '../assets/msn-logo.png';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const savedEmail = localStorage.getItem('remembered_email');
        const savedPassword = localStorage.getItem('remembered_password');
        if (savedEmail && savedPassword) {
            setEmail(savedEmail);
            setPassword(savedPassword);
            setRemember(true);
        }
    }, []);

    const handleLogin = async () => {
        if (!email || !password) {
            alert("Please fill all fields.");
            return;
        }
        try {
            const response = await fetch("https://iletapi.onrender.com/user/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            let data: any = null;
            let errorText = '';

            if (response.ok) {
                data = await response.json();
                localStorage.setItem('token', data.token);
                if (remember) {
                    localStorage.setItem('remembered_email', email);
                    localStorage.setItem('remembered_password', password);
                } else {
                    localStorage.removeItem('remembered_email');
                    localStorage.removeItem('remembered_password');
                }
                navigate('/dashboard');
            } else {
                const contentType = response.headers.get("Content-Type") || "";
                if (contentType.includes("application/json")) {
                    data = await response.json();
                    alert(data.message || 'Login failed.');
                } else {
                    errorText = await response.text();
                    alert(errorText || 'Login failed (plain error).');
                }
            }
        } catch (error: any) {
            alert('Network error: ' + error.message);
        }


    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <div style={{
                background: '#ffffff',
                border: '1px solid #cccccc',
                borderRadius: '8px',
                padding: '2rem',
                width: '300px',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                <img
                    src={logo}
                    alt="MSN Logo"
                    style={{ width: '80px', marginBottom: '1rem' }}
                />
                <h2 style={{ marginBottom: '1rem', fontSize: '18px' }}>ilet Messenger</h2>
                <input
                    type="text"
                    placeholder="E-mail address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        width: '100%',
                        marginBottom: '0.5rem',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                    }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                        width: '100%',
                        marginBottom: '0.5rem',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                    }}
                />
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={() => setRemember(!remember)}
                        style={{ marginRight: '5px' }}
                    />
                    <label style={{ fontSize: '14px' }}>Beni hatırla</label>
                </div>
                <button
                    style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: '#dfeaff',
                        border: '1px solid #7aa9ff',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                    }}
                    onClick={handleLogin}
                >
                    Sign In/Login
                </button>
            </div>
        </div>
    );
}
