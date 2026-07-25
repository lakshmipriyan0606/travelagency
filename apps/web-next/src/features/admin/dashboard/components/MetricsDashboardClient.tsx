"use client";

import { useEffect, useState } from 'react';
import axiosClient from '@/api/axiosClient';
import { Activity } from 'lucide-react';
import { VisitorData, ApiRouteStat, ApiRouteDetail, ApiUsageData } from '../types';
import { MetricsStatCards } from './MetricsStatCards';
import { VisitorChart } from './VisitorChart';
import { ApiUsageChart } from './ApiUsageChart';

const parseDevice = (ua: string | undefined = '') => {
    if (!ua || ua === 'Unknown') return { label: 'Unknown Device', isMobile: false };
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
    const os = /Windows/i.test(ua) ? 'Windows' :
               /Mac OS/i.test(ua) ? 'Mac' :
               /Linux/i.test(ua) ? 'Linux' :
               /Android/i.test(ua) ? 'Android' :
               /iOS|iPhone|iPad/i.test(ua) ? 'iOS' : 'Unknown OS';
    const browser = /Edg/i.test(ua) ? 'Edge' :
                    /Chrome/i.test(ua) ? 'Chrome' :
                    /Firefox/i.test(ua) ? 'Firefox' :
                    /Safari/i.test(ua) ? 'Safari' : 'Unknown Browser';
    return { label: `${os} · ${browser}`, isMobile };
};

const getUtcToday = () => new Date().toISOString().split('T')[0];

const MetricsDashboardClient = () => {
    const [totalRequests, setTotalRequests] = useState<number>(0);
    const [visitorStats, setVisitorStats] = useState<VisitorData[]>([]);
    const [apiStats, setApiStats] = useState<ApiRouteStat[]>([]);
    const [apiRouteDetails, setApiRouteDetails] = useState<ApiRouteDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<VisitorData | null>(null);
    const [selectedRoute, setSelectedRoute] = useState<ApiRouteDetail | null>(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [visitorRes, apiUsageRes] = await Promise.all([
                    axiosClient.get("/analytics/daily"),
                    axiosClient.get("/analytics/api-usage"),
                ]);
                setVisitorStats(visitorRes.data.data || []);
                const apiUsage: ApiUsageData = apiUsageRes.data;
                setTotalRequests(apiUsage.todayTotal || 0);
                setApiStats(apiUsage.topRoutes || []);
                setApiRouteDetails(apiUsage.routeDetails || []);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
        const interval = setInterval(loadDashboardData, 5000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12 h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const todayString = getUtcToday();
    const todayVisitors = visitorStats.find(v => v._id === todayString)?.count || 0;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8 relative">
            <div>
                <h2 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
                    <Activity className="text-blue-600" /> System Dashboard
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                    Simplified overview of your application traffic and usage.
                </p>
            </div>

            <MetricsStatCards todayVisitors={todayVisitors} totalRequests={totalRequests} />
            
            <VisitorChart 
                visitorStats={visitorStats} 
                selectedDay={selectedDay} 
                setSelectedDay={setSelectedDay} 
                parseDevice={parseDevice} 
            />

            <ApiUsageChart 
                apiStats={apiStats} 
                selectedRoute={selectedRoute} 
                setSelectedRoute={setSelectedRoute} 
                apiRouteDetails={apiRouteDetails} 
            />
        </div>
    );
};

export default MetricsDashboardClient;
