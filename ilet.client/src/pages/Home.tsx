import { useState, useEffect } from "react";
import logo from '../assets/msn-logo.png';
import { useNavigate } from 'react-router-dom';
import config from "../config";
import { useTranslation } from "react-i18next";

export default function Home() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // 👈 Şifre gösterme durumu
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const savedEmail = localStorage.getItem('remembered_email');
        const savedPassword = localStorage.getItem('remembered_password');
        if (savedEmail && savedPassword) {
            setEmail(savedEmail);
            setPassword(savedPassword);
            setRemember(true);
        }
    }, []);
    const handleLoginOrSignup = async () => {
        console.log("Email:", email);
        console.log("Password:", password);
        console.log("Signup gönderilen veri:", JSON.stringify({ email, password }));
        if (!email || !password) {
            alert("Please fill all fields.");
            return;
        }
        try {
            const loginResponse = await fetch(`${config.API_URL}user/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            if (loginResponse.ok) {
                const data = await loginResponse.json();
                localStorage.setItem('userId', data.id);
                localStorage.setItem('status', data.status);
                handleSuccess(data);
            } else {
                const data = await loginResponse.json();

                if (data.message === "Kullanıcı bulunamadı.") {
                    const signupResponse = await fetch(`${config.API_URL}user/signup`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password }),
                        credentials: 'include',
                    });

                    if (signupResponse.ok) {
                        // ✅ Otomatik login
                        const loginAfterSignup = await fetch(`${config.API_URL}user/login`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email, password }),
                            credentials: 'include',
                        });

                        if (loginAfterSignup.ok) {
                            const loginData = await loginAfterSignup.json();
                            handleSuccess(loginData);
                        } else {
                            alert("Signup başarılı ama login başarısız.");
                        }
                    } else {
                        const signupError = await signupResponse.json();
                        alert(signupError.message || "Signup başarısız.");
                    }
                } else {
                    alert(data.message || "Login başarısız.");
                }
            }
        } catch (error: any) {
            alert('Network error: ' + error.message);
        }
    };
    const handleSuccess = (data: any) => {
        const token = data.Token || data.token;
        const user = data.User || data.user;

        if (!token || !user) {
            alert("Hatalı yanıt formatı!");
            return;
        }

        localStorage.setItem('token', token);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('nickname', user.nickname);
        localStorage.setItem('status', user.status || '');
        localStorage.setItem('profilePictureUrl', user.profilePictureUrl || logo);
        localStorage.setItem('email', user.email);
        if (user.language) {
            i18n.changeLanguage(user.language);
            localStorage.setItem("language", user.language);
        }
        if (remember) {
            localStorage.setItem('remembered_email', email);
            localStorage.setItem('remembered_password', password);
        } else {
            localStorage.removeItem('remembered_email');
            localStorage.removeItem('remembered_password');
        }

        navigate('/dashboard');
    };
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleLoginOrSignup();
                }}
                style={{
                    background: '#ffffff',
                    border: '1px solid #cccccc',
                    borderRadius: '8px',
                    padding: '2rem',
                    width: '300px',
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}
            >
                <img
                    src={logo}
                    alt="MSN Logo"
                    style={{ width: '80px', marginBottom: '1rem' }}
                />
                <h2 style={{ marginBottom: '1rem', fontSize: '18px' }}>ilet Messenger</h2>

                {/* Email */}
                <div style={{ marginBottom: '0.5rem', textAlign: 'left' }}>
                    <label htmlFor="login-email" style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>E-posta</label>
                    <input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="E-mail address"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            paddingRight: '2.5rem',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Password */}
                <div style={{ position: 'relative', marginBottom: '0.5rem', textAlign: 'left' }}>
                    <label htmlFor="login-password" style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>Şifre</label>
                    <input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            paddingRight: '2.5rem',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            boxSizing: 'border-box'
                        }}
                    />
                    <span
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: "absolute",
                            right: "0.75rem",
                            top: "calc(50% + 8px)",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            userSelect: "none",
                            fontSize: "18px"
                        }}
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </span>
                </div>

                {/* Remember Me */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <input
                        id="remember"
                        type="checkbox"
                        checked={remember}
                        onChange={() => setRemember(!remember)}
                        style={{ marginRight: '5px' }}
                    />
                    <label htmlFor="remember" style={{ fontSize: '14px' }}>Beni hatırla</label>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: '#dfeaff',
                        border: '1px solid #7aa9ff',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                    }}
                >
                    {t("login_button")}
                </button>
            </form>
        </div>
    );

}
