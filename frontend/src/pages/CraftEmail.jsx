import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { templatesAPI, uploadAPI, emailAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  Send, 
  FileText, 
  Paperclip, 
  Calendar,
  Clock,
  Save,
  Check,
  X,
  ChevronDown,
  Mail
} from 'lucide-react';

const CraftEmail = () => {
  const [templates, setTemplates] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [step1Completed, setStep1Completed] = useState(false);
  const [step2Completed, setStep2Completed] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [timeHour, setTimeHour] = useState('12');
  const [timeMinute, setTimeMinute] = useState('00');
  const [timeAmPm, setTimeAmPm] = useState('AM');

  // Convert AM/PM time to 24-hour format
  const updateScheduledTime = (hour, minute, ampm) => {
    let hour24 = parseInt(hour);
    if (ampm === 'AM' && hour24 === 12) {
      hour24 = 0;
    } else if (ampm === 'PM' && hour24 !== 12) {
      hour24 += 12;
    }
    const timeString = `${hour24.toString().padStart(2, '0')}:${minute}`;
    setScheduledTime(timeString);
  };

  // Update scheduled time when any time component changes
  useEffect(() => {
    updateScheduledTime(timeHour, timeMinute, timeAmPm);
  }, [timeHour, timeMinute, timeAmPm]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    loadTemplates();
    loadAttachments();
  }, []);

  // Lock body scroll when any modal is open
  useEffect(() => {
    const isAnyModalOpen = showTemplateModal || showAttachmentModal || showScheduleModal || showTemplatePreview;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showTemplateModal, showAttachmentModal, showScheduleModal, showTemplatePreview]);

  const loadTemplates = async () => {
    try {
      const response = await templatesAPI.getAll();

      // Handle the API response structure - backend returns {success: true, data: {templates: [...]}}
      const templatesData = response.data.data?.templates || response.data.templates || response.data;

      setTemplates(Array.isArray(templatesData) ? templatesData : []);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
      setTemplates([]);
    }
  };

  const loadAttachments = async () => {
    try {
      const response = await uploadAPI.getAll();

      // Handle the API response structure - backend returns {success: true, data: {attachments: [...]}}
      const attachmentsData = response.data.data?.attachments || response.data.attachments || response.data;

      setAttachments(Array.isArray(attachmentsData) ? attachmentsData : []);
    } catch (error) {
      console.error('Failed to load attachments:', error);
      toast.error('Failed to load attachments');
      setAttachments([]);
    }
  };

  const handleTemplatePreview = (template) => {
    setPreviewTemplate(template);
    setShowTemplateModal(false);
    setShowTemplatePreview(true);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowTemplatePreview(false);
    setShowTemplateModal(false); // Close the template selection modal
    
    // Extract placeholders from template body
    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    const placeholders = [];
    let match;
    while ((match = placeholderRegex.exec(template.body)) !== null) {
      if (!placeholders.includes(match[1])) {
        placeholders.push(match[1]);
      }
    }
    
    // Initialize form fields for placeholders
    placeholders.forEach(placeholder => {
      setValue(placeholder, '');
    });
    
    // Don't complete step 1 yet - let user fill placeholders first
    setStep1Completed(false);
  };

  const completeStep1 = () => {
    setStep1Completed(true);
  };

  const handleAttachmentToggle = (attachment) => {
    setSelectedAttachments(prev => {
      const exists = prev.find(a => a.id === attachment.id);
      if (exists) {
        return prev.filter(a => a.id !== attachment.id);
      } else {
        return [...prev, attachment];
      }
    });
  };

  const completeStep2 = () => {
    setShowAttachmentModal(false);
    setStep2Completed(true);
  };

  const selectNoAttachments = () => {
    setSelectedAttachments([]);
    setShowAttachmentModal(false);
    setStep2Completed(true);
  };

  const sendEmail = async (type) => {
    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return;
    }

    setLoading(true);
    try {
      const formData = watch();
      
      // Replace placeholders in template
      let emailBody = selectedTemplate.body;
      let emailSubject = selectedTemplate.subject;
      
      const templatePlaceholders = [];
      const placeholderRegex = /\{\{([^}]+)\}\}/g;
      let match;
      while ((match = placeholderRegex.exec(selectedTemplate.body)) !== null) {
        if (!templatePlaceholders.includes(match[1])) {
          templatePlaceholders.push(match[1]);
        }
      }
      
      templatePlaceholders.forEach(placeholder => {
        const value = formData[placeholder] || '';
        emailBody = emailBody.replace(new RegExp(`\\{\\{${placeholder}\\}\\}`, 'g'), value);
        emailSubject = emailSubject.replace(new RegExp(`\\{\\{${placeholder}\\}\\}`, 'g'), value);
      });

      const emailData = {
        to: formData.recipientEmail,
        subject: emailSubject,
        body: emailBody,
        attachmentIds: selectedAttachments.map(att => att.id),
        type: type,
      };

      if (type === 'schedule') {
        if (!scheduledDate || !timeHour || !timeMinute) {
          toast.error('Please select date and time for scheduled email');
          return;
        }
        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
        
        // Validate the date
        if (isNaN(scheduledDateTime.getTime())) {
          toast.error('Invalid date or time selected');
          return;
        }
        
        // Check if the scheduled time is in the future
        if (scheduledDateTime <= new Date()) {
          toast.error('Scheduled time must be in the future');
          return;
        }
        
        emailData.scheduledAt = scheduledDateTime.toISOString();
        setShowScheduleModal(false);
      }

      const response = await emailAPI.sendEmail(emailData);
      
      if (type === 'send') {
        toast.success('Email sent successfully!');
      } else if (type === 'schedule') {
        toast.success('Email scheduled successfully!');
      } else if (type === 'draft') {
        toast.success('Email saved as draft!');
      }

      // Reset form
      resetForm();
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedTemplate(null);
    setSelectedAttachments([]);
    setStep1Completed(false);
    setStep2Completed(false);
    setScheduledDate('');
    setScheduledTime('');
    setTimeHour('12');
    setTimeMinute('00');
    setTimeAmPm('AM');
  };

  const extractPlaceholders = (template) => {
    if (!template?.body) return [];
    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    const placeholders = [];
    let match;
    while ((match = placeholderRegex.exec(template.body)) !== null) {
      if (!placeholders.includes(match[1])) {
        placeholders.push(match[1]);
      }
    }
    return placeholders;
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Craft Email</h1>
        <p className="text-gray-600 px-4">Create and send personalized emails using templates and attachments</p>
      </div>

      {/* Steps */}
      <div className="space-y-8">
        {/* Step 1: Select Template */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                step1Completed ? 'bg-green-100 text-green-600' : 'bg-primary-100 text-primary-600'
              }`}>
                {step1Completed ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Select Template</h2>
            </div>
            {step1Completed && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedTemplate(null);
                    setStep1Completed(false);
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Change
                </button>
                <Check className="w-6 h-6 text-green-600" />
              </div>
            )}
          </div>

          {step1Completed ? (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-900">{selectedTemplate.name}</h3>
                  <p className="text-sm text-green-700">Subject: {selectedTemplate.subject}</p>
                </div>
                <Check className="w-5 h-5 text-green-600" />
              </div>
            </div>
          ) : !selectedTemplate ? (
            <button
              onClick={() => setShowTemplateModal(true)}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
            >
              <FileText className="w-5 h-5 mr-2" />
              Select Template
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{selectedTemplate.name}</h3>
                <p className="text-sm text-gray-600 mb-3">Subject: {selectedTemplate.subject}</p>
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedTemplate.body }} />
              </div>

              {/* Placeholder form */}
              {extractPlaceholders(selectedTemplate).length > 0 && (
                <form className="space-y-4">
                  <h4 className="font-medium text-gray-900">Fill in placeholders:</h4>
                  {extractPlaceholders(selectedTemplate).map((placeholder) => (
                    <div key={placeholder}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {placeholder}
                      </label>
                      <input
                        type="text"
                        {...register(placeholder, { required: `${placeholder} is required` })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder={`Enter ${placeholder}`}
                      />
                      {errors[placeholder] && (
                        <p className="text-red-500 text-sm mt-1">{errors[placeholder].message}</p>
                      )}
                    </div>
                  ))}
                </form>
              )}

              {/* Recipient email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  {...register('recipientEmail', { required: 'Recipient email is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter recipient email"
                />
                {errors.recipientEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.recipientEmail.message}</p>
                )}
              </div>

              {/* Preview with filled placeholders */}
              {extractPlaceholders(selectedTemplate).length > 0 && (
                <div className="border-t pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      const formData = watch();
                      let previewSubject = selectedTemplate.subject;
                      let previewBody = selectedTemplate.body;
                      
                      extractPlaceholders(selectedTemplate).forEach(placeholder => {
                        const value = formData[placeholder] || `{{${placeholder}}}`;
                        previewSubject = previewSubject.replace(new RegExp(`\\{\\{${placeholder}\\}\\}`, 'g'), value);
                        previewBody = previewBody.replace(new RegExp(`\\{\\{${placeholder}\\}\\}`, 'g'), value);
                      });
                      
                      setPreviewTemplate({
                        ...selectedTemplate,
                        subject: previewSubject,
                        body: previewBody,
                        isFilledPreview: true
                      });
                      setShowTemplatePreview(true);
                    }}
                    className="w-full bg-blue-100 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors mb-4"
                  >
                    Preview with Filled Placeholders
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Change template
                </button>
                <button
                  onClick={completeStep1}
                  className="bg-primary-600 text-white py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Proceed
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Add Attachments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                step2Completed ? 'bg-green-100 text-green-600' : 'bg-primary-100 text-primary-600'
              }`}>
                {step2Completed ? <Check className="w-5 h-5" /> : '2'}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Add Attachments</h2>
            </div>
            {step2Completed && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setStep2Completed(false)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Change
                </button>
                <Check className="w-6 h-6 text-green-600" />
              </div>
            )}
          </div>

          {step2Completed ? (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-900">
                    {selectedAttachments.length === 0 
                      ? 'No attachments selected' 
                      : `${selectedAttachments.length} attachment(s) selected`
                    }
                  </h3>
                  {selectedAttachments.length > 0 && (
                    <p className="text-sm text-green-700">
                      {selectedAttachments.map(att => att.originalName).join(', ')}
                    </p>
                  )}
                </div>
                <Check className="w-5 h-5 text-green-600" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowAttachmentModal(true)}
                  className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
                >
                  <Paperclip className="w-5 h-5 mr-2" />
                  Add Attachments
                </button>
                <button
                  onClick={selectNoAttachments}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <X className="w-5 h-5 mr-2" />
                  Add None
                </button>
              </div>

              {selectedAttachments.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Selected Attachments ({selectedAttachments.length})</h4>
                  <div className="space-y-2">
                    {selectedAttachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{attachment.originalName}</span>
                        <button
                          onClick={() => handleAttachmentToggle(attachment)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={completeStep2}
                    className="mt-3 w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Proceed
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Send Email</h2>
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            <button
              onClick={() => sendEmail('send')}
              disabled={loading || !step1Completed || !step2Completed}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm lg:text-base"
            >
              <Send className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
              {loading ? 'Sending...' : 'Send Now'}
            </button>

            <button
              onClick={() => setShowScheduleModal(true)}
              disabled={loading || !step1Completed || !step2Completed}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm lg:text-base"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Schedule Send
            </button>

            <button
              onClick={() => sendEmail('draft')}
              disabled={loading || !step1Completed || !step2Completed}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Save className="w-5 h-5 mr-2" />
              Save as Draft
            </button>
          </div>
          
          {/* Status message */}
          {(!step1Completed || !step2Completed) && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full ${step1Completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>Template Selected</span>
                </div>
                <div className="mx-2 text-gray-400">•</div>
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full ${step2Completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>Attachments Ready</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Complete both steps above to enable email actions
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <>
          {/* Full screen overlay - covers entire document */}
          <div className="fixed bg-black bg-opacity-50 z-[60]" style={{ top: 0, left: 0, width: '100vw', height: '100vh', margin: 0, padding: 0, position: 'fixed', zIndex: 60, minHeight: '100vh', minWidth: '100vw' }} />
          {/* Modal content */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[70]" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] lg:max-h-[80vh] overflow-y-auto relative mx-4 lg:mx-0">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Select Template</h3>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                {templates.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No templates available</p>
                ) : (
                  <div className="space-y-3">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                      >
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-600 mt-1 mb-3">{template.subject}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTemplatePreview(template)}
                            className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                          >
                            See Preview
                          </button>
                          <button
                            onClick={() => handleTemplateSelect(template)}
                            className="flex-1 bg-primary-600 text-white py-2 px-3 rounded-lg hover:bg-primary-700 transition-colors text-sm"
                          >
                            Select Template
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Attachment Selection Modal */}
      {showAttachmentModal && (
        <>
          {/* Full screen overlay - covers entire document */}
          <div className="fixed bg-black bg-opacity-50 z-[60]" style={{ top: 0, left: 0, width: '100vw', height: '100vh', margin: 0, padding: 0, position: 'fixed', zIndex: 60, minHeight: '100vh', minWidth: '100vw' }} />
          {/* Modal content */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[70]" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] lg:max-h-[80vh] overflow-y-auto relative mx-4 lg:mx-0">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Select Attachments</h3>
                <button
                  onClick={() => setShowAttachmentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                {attachments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No attachments available</p>
                ) : (
                  <div className="space-y-3">
                    {attachments.map((attachment) => (
                      <label
                        key={attachment.id}
                        className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAttachments.find(a => a.id === attachment.id) ? true : false}
                          onChange={() => handleAttachmentToggle(attachment)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1"
                        />
                        <div className="ml-3 flex-1">
                          <h4 className="font-medium text-gray-900">{attachment.originalName}</h4>
                          <p className="text-sm text-gray-600">{(attachment.size / 1024 / 1024).toFixed(2)} MB</p>
                          {attachment.description && (
                            <p className="text-sm text-gray-500 mt-1 italic">"{attachment.description}"</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={selectNoAttachments}
                    className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Add None
                  </button>
                  <button
                    onClick={completeStep2}
                    className="bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Proceed
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <>
          {/* Full screen overlay - covers entire document */}
          <div className="fixed bg-black bg-opacity-50 z-[60]" style={{ top: 0, left: 0, width: '100vw', height: '100vh', margin: 0, padding: 0, position: 'fixed', zIndex: 60, minHeight: '100vh', minWidth: '100vw' }} />
          {/* Modal content */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[70]" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="bg-white rounded-xl max-w-md w-full relative mx-4 lg:mx-0">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Schedule Email</h3>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <div className="flex space-x-2">
                    {/* Hour */}
                    <select
                      value={timeHour}
                      onChange={(e) => setTimeHour(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {Array.from({length: 12}, (_, i) => {
                        const hour = (i + 1).toString();
                        return (
                          <option key={hour} value={hour}>
                            {hour}
                          </option>
                        );
                      })}
                    </select>
                    
                    <span className="flex items-center text-gray-500">:</span>
                    
                    {/* Minute */}
                    <select
                      value={timeMinute}
                      onChange={(e) => setTimeMinute(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {Array.from({length: 60}, (_, i) => {
                        const minute = i.toString().padStart(2, '0');
                        return (
                          <option key={minute} value={minute}>
                            {minute}
                          </option>
                        );
                      })}
                    </select>
                    
                    {/* AM/PM */}
                    <select
                      value={timeAmPm}
                      onChange={(e) => setTimeAmPm(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => sendEmail('schedule')}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Template Preview Modal */}
      {showTemplatePreview && previewTemplate && (
        <>
          {/* Full screen overlay - covers entire document */}
          <div className="fixed bg-black bg-opacity-50 z-[60]" style={{ top: 0, left: 0, width: '100vw', height: '100vh', margin: 0, padding: 0, position: 'fixed', zIndex: 60, minHeight: '100vh', minWidth: '100vw' }} />
          {/* Modal content */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[70]" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] lg:max-h-[80vh] overflow-y-auto relative mx-4 lg:mx-0">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {previewTemplate.isFilledPreview ? 'Preview with Filled Placeholders' : 'Template Preview'}
                </h3>
                <button
                  onClick={() => setShowTemplatePreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <div className={`rounded-lg p-6 mb-6 ${previewTemplate.isFilledPreview ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{previewTemplate.name}</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>Subject:</strong> {previewTemplate.subject}
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Email Body:</h5>
                    <div 
                      className="prose prose-sm max-w-none text-gray-900" 
                      dangerouslySetInnerHTML={{ __html: previewTemplate.body }} 
                    />
                  </div>
                </div>

                {/* Show placeholders if any and not filled preview */}
                {!previewTemplate.isFilledPreview && extractPlaceholders(previewTemplate).length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">Placeholders detected:</h5>
                    <div className="flex flex-wrap gap-2">
                      {extractPlaceholders(previewTemplate).map((placeholder) => (
                        <span
                          key={placeholder}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {`{{${placeholder}}}`}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                      You'll be able to fill in these placeholders after selecting this template.
                    </p>
                  </div>
                )}

                {/* Show success message for filled preview */}
                {previewTemplate.isFilledPreview && (
                  <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
                    <h5 className="text-sm font-medium text-green-900 mb-2">✅ Preview with your filled placeholders</h5>
                    <p className="text-xs text-green-700">
                      This is how your email will look when sent. You can go back to edit placeholders or proceed.
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowTemplatePreview(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {previewTemplate.isFilledPreview ? 'Back to Form' : 'Back to Templates'}
                  </button>
                  {!previewTemplate.isFilledPreview && (
                    <button
                      onClick={() => handleTemplateSelect(previewTemplate)}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Proceed with This Template
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CraftEmail;
