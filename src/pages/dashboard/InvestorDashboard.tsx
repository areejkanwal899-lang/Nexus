import React, { useState, useEffect } from 'react';
import { Users, Bell, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CollaborationRequestCard } from '../../components/collaboration/CollaborationRequestCard';
import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';
import { useAuth } from '../../context/AuthContext';
import { CollaborationRequest } from '../../types';
import { getRequestsForEntrepreneur } from '../../data/collaborationRequests'; // Fixed import here
import { entrepreneurs } from '../../data/users';
import { MeetingCalendar } from '../../components/collaboration/MeetingCalendar';

export const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [collaborationRequests, setCollaborationRequests] = useState<CollaborationRequest[]>([]);
  const [recommendedEntrepreneurs] = useState(entrepreneurs.slice(0, 3));
  
  useEffect(() => {
    if (user) {
      // Using the available function safely
      const requests = getRequestsForEntrepreneur(user.id);
      setCollaborationRequests(requests);
    }
  }, [user]);
  
  const handleRequestStatusUpdate = (requestId: string, status: 'accepted' | 'rejected') => {
    setCollaborationRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === requestId ? { ...req, status } : req
      )
    );
  };
  
  if (!user) return null;
  
  const pendingRequests = collaborationRequests.filter(req => req.status === 'pending');
  
  return (
    <div className="space-y-6 animate-fade-in w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-gray-600">Here's your investment overview for today</p>
        </div>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary-50 border border-primary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full mr-4"><Bell size={20} className="text-primary-700" /></div>
              <div>
                <p className="text-sm font-medium text-primary-700">Pending Pitches</p>
                <h3 className="text-xl font-semibold text-primary-900">{pendingRequests.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-secondary-50 border border-secondary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-full mr-4"><Users size={20} className="text-secondary-700" /></div>
              <div>
                <p className="text-sm font-medium text-secondary-700">Portfolio Startups</p>
                <h3 className="text-xl font-semibold text-primary-900">{collaborationRequests.filter(req => req.status === 'accepted').length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-accent-50 border border-accent-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-full mr-4"><Calendar size={20} className="text-accent-700" /></div>
              <div>
                <p className="text-sm font-medium text-accent-700">Scheduled Calls</p>
                <h3 className="text-xl font-semibold text-accent-900">2</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-success-50 border border-success-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4"><TrendingUp size={20} className="text-success-700" /></div>
              <div>
                <p className="text-sm font-medium text-success-700">Total Invested</p>
                <h3 className="text-xl font-semibold text-success-900">$2.4M</h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Incoming Collaboration Pitches</h2>
              <Badge variant="primary">{pendingRequests.length} pending</Badge>
            </CardHeader>
            <CardBody>
              {collaborationRequests.length > 0 ? (
                <div className="space-y-4">
                  {collaborationRequests.map(request => (
                    <CollaborationRequestCard key={request.id} request={request} onStatusUpdate={handleRequestStatusUpdate} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4"><AlertCircle size={24} className="text-gray-500" /></div>
                  <p className="text-gray-600">No pitch requests yet</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Trending Startups</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {recommendedEntrepreneurs.map(entrepreneur => (
                <EntrepreneurCard key={entrepreneur.id} entrepreneur={entrepreneur} showActions={false} />
              ))}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Full Width Calendar Section */}
      <div className="w-full block clear-both pt-6">
        <MeetingCalendar />
      </div>
    </div>
  );
};