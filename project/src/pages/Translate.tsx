import React from 'react';
import DetectJSX from '../components/Detect';
import { useNavigate } from 'react-router-dom';

export default function Translate() {
    const navigate = useNavigate();

    React.useEffect(()=>{
        if(!localStorage.getItem('token')){
            navigate('/login')
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                        <DetectJSX/>
                    </div>
                </div>
            </div>
        </div>
    );
}