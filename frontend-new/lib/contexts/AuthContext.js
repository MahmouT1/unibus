// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getStoredUser, getStoredStudent, isAuthenticated } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            try {
                if (isAuthenticated()) {
                    const storedUser = getStoredUser();
                    const storedStudent = getStoredStudent();

                    setUser(storedUser);
                    setStudent(storedStudent);
                    setIsLoggedIn(true);

                    // Verify token is still valid
                    try {
                        const response = await authAPI.getCurrentUser();
                        if (response.success) {
                            setUser(response.user);
                            setStudent(response.student);
                        }
                    } catch (error) {
                        // Token invalid, clear auth state
                        logout();
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                logout();
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (credentials) => {
        try {
            setLoading(true);
            const response = await authAPI.login(credentials);

            if (response.success) {
                setUser(response.user);
                setStudent(response.student);
                setIsLoggedIn(true);
                return { success: true };
            }

            return { success: false, message: response.message };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Login failed'
            };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            const response = await authAPI.register(userData);

            if (response.success) {
                setUser(response.user);
                setStudent(response.student);
                setIsLoggedIn(true);
                return { success: true };
            }

            return { success: false, message: response.message };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Registration failed'
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setStudent(null);
            setIsLoggedIn(false);
        }
    };

    const updateStudent = (updatedStudent) => {
        setStudent(updatedStudent);
        localStorage.setItem('student', JSON.stringify(updatedStudent));
    };

    const value = {
        user,
        student,
        loading,
        isLoggedIn,
        login,
        register,
        logout,
        updateStudent
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;