import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { templatesAPI, uploadAPI, authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  Send, 
  FileText, 
  Paperclip, 
  Users, 
  Clock,
  CheckCircle,
  ArrowRight,
  Mail
} from 'lucide-react';

const SendEmail = () => {
  const [stats, setStats] = useState({
    templates: 0,
    attachments: 0,
    emailsSent: 0,
    drafts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    
    // Add event listener for window focus to refresh stats when user returns to dashboard
    const handleWindowFocus = () => {
      loadStats();
    };
    const handleStatsUpdate = () => {
      loadStats();
    };
    
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('statsUpdate', handleStatsUpdate);
    
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('statsUpdate', handleStatsUpdate);
    };
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Load individual counts
      let templateCount = 0;
      let attachmentCount = 0;
      let emailsSent = 0;
      let draftsCreated = 0;
      
      try {
        const templatesResponse = await templatesAPI.getAll();
        const templatesData = Array.isArray(templatesResponse.data) ? templatesResponse.data : templatesResponse.data?.templates || [];
        templateCount = templatesData.length;
      } catch (error) {
        console.error('Failed to load templates:', error);
      }
      
      try {
        const attachmentsResponse = await uploadAPI.getAll();
        const attachmentsData = Array.isArray(attachmentsResponse.data) ? attachmentsResponse.data : attachmentsResponse.data?.attachments || [];
        attachmentCount = attachmentsData.length;
      } catch (error) {
        console.error('Failed to load attachments:', error);
      }
      
      try {
        const profileResponse = await authAPI.getProfile();
        const profileData = profileResponse.data?.data || profileResponse.data;
        emailsSent = profileData?.emailsSent || 0;
        draftsCreated = profileData?.draftsCreated || 0;
      } catch (error) {
        console.error('Failed to load profile stats:', error);
      }
      
      setStats({
        templates: templateCount,
        attachments: attachmentCount,
        emailsSent: emailsSent,
        drafts: draftsCreated
      });
      
    } catch (error) {
      console.error('Failed to load stats:', error);
      toast.error('Failed to load dashboard data');
      
      // Set default values on complete failure
      setStats({
        templates: 0,
        attachments: 0,
        emailsSent: 0,
        drafts: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const dashboardCards = [
    {
      title: 'Craft Email',
      description: 'Create and send personalized emails using templates',
      icon: Send,
      href: '/craft-email',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Templates',
      description: 'Manage your email templates with placeholders',
      icon: FileText,
      href: '/templates',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      count: stats?.templates || 0
    },
    {
      title: 'Attachments',
      description: 'Upload and manage files for your emails',
      icon: Paperclip,
      href: '/attachments',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      count: stats?.attachments || 0
    },
    {
      title: 'Mass Email',
      description: 'Send bulk emails using Excel data and templates',
      icon: Users,
      href: '/mass-email',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    }
  ];

  const quickStats = [
    {
      name: 'Templates',
      value: stats?.templates || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Attachments',
      value: stats?.attachments || 0,
      icon: Paperclip,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Emails Sent',
      value: stats?.emailsSent || 0,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Drafts',
      value: stats?.drafts || 0,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-lg sm:text-xl text-gray-600 px-4">Manage your email campaigns, templates, and attachments</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {quickStats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center">
              <div className={`w-10 h-10 lg:w-12 lg:h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 lg:w-6 lg:h-6 ${stat.color}`} />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {dashboardCards.map((card) => (
          <Link
            key={card.title}
            to={card.href}
            className="group bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-8 hover:shadow-md hover:border-primary-300 transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3 lg:mb-4">
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                    <card.icon className={`w-5 h-5 lg:w-6 lg:h-6 ${card.textColor}`} />
                  </div>
                  {card.count !== undefined && (
                    <div className="ml-3">
                      <span className="inline-flex items-center px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs lg:text-sm font-medium bg-gray-100 text-gray-800">
                        {card.count} items
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-600 mb-3 lg:mb-4 text-sm lg:text-base">{card.description}</p>
                <div className="flex items-center text-primary-600 group-hover:text-primary-700 transition-colors">
                  <span className="text-xs lg:text-sm font-medium">Get started</span>
                  <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SendEmail;