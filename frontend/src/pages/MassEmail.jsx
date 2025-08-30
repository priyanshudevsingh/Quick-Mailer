import { useState, useEffect } from 'react';
import { templatesAPI, uploadAPI, emailAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Download, Upload, Users, FileText, Paperclip, Send, Clock } from 'lucide-react';

const MassEmail = () => {
  const [templates, setTemplates] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingDrafts, setSavingDrafts] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);

  useEffect(() => {
    loadTemplates();
    loadAttachments();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await templatesAPI.getAll();
      // Handle the API response structure - backend returns {success: true, data: {templates: [...]}}
      const templatesData = response.data.data?.templates || response.data.templates || response.data;
      setTemplates(Array.isArray(templatesData) ? templatesData : []);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
      setTemplates([]); // Ensure templates is always an array
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
      setAttachments([]); // Ensure attachments is always an array
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setUploadedFile(null);
    setPreviewData([]);
  };

  const handleAttachmentToggle = (attachmentId) => {
    setSelectedAttachments(prev => 
      prev.includes(attachmentId)
        ? prev.filter(id => id !== attachmentId)
        : [...prev, attachmentId]
    );
  };

  const handleDownloadTemplate = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return;
    }

    try {
      const response = await emailAPI.generateMassEmailTemplate(selectedTemplate.id);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mass_email_template_${selectedTemplate.name}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Excel template downloaded successfully!');
    } catch (error) {
      console.error('Failed to download template:', error);
      toast.error('Failed to download template');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return;
    }

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setUploadedFile(file);
    
    // Read and preview the file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // For preview, we'll just show the file name and size
        setPreviewData([{
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          rows: 'Preview not available'
        }]);
      } catch (error) {
        console.error('Error reading file:', error);
        toast.error('Error reading file');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSendMassEmail = async () => {
    if (!selectedTemplate || !uploadedFile) {
      toast.error('Please select a template and upload an Excel file');
      return;
    }

    setLoading(true);
    try {
      await emailAPI.sendMassEmail(selectedTemplate.id, selectedAttachments, uploadedFile);
      toast.success('Mass emails sent successfully!');
      
      // Reset form
      setSelectedTemplate(null);
      setSelectedAttachments([]);
      setUploadedFile(null);
      setPreviewData([]);
    } catch (error) {
      console.error('Failed to send mass emails:', error);
      toast.error(error.response?.data?.error || 'Failed to send mass emails');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDrafts = async () => {
    if (!selectedTemplate || !uploadedFile) {
      toast.error('Please select a template and upload an Excel file');
      return;
    }

    setSavingDrafts(true);
    try {
      const response = await emailAPI.saveMassEmailAsDrafts(selectedTemplate.id, selectedAttachments, uploadedFile);
      
      if (response.data.success) {
        toast.success(response.data.message);
        
        // Show detailed results - backend returns successCount/failureCount, not summary
        const result = response.data.data || response.data;
        if (result.failureCount > 0) {
          toast.warn(`${result.successCount} drafts created, ${result.failureCount} failed`);
        }
      }
      
      // Reset form
      setSelectedTemplate(null);
      setSelectedAttachments([]);
      setUploadedFile(null);
      setPreviewData([]);
    } catch (error) {
      console.error('Failed to save mass emails as drafts:', error);
      toast.error(error.response?.data?.error || 'Failed to save mass emails as drafts');
    } finally {
      setSavingDrafts(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mass Email</h1>
        <p className="text-gray-600">Send personalized emails to multiple recipients using Excel data</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Template Selection */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Select Template
          </h2>
          
          {!Array.isArray(templates) || templates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No templates</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create a template first to use mass email.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.isArray(templates) && templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`border border-gray-200 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-primary-300 bg-primary-50'
                      : 'hover:border-primary-300 hover:shadow-md'
                  }`}
                >
                  <h3 className="font-medium text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {(template.placeholders || []).length} placeholder(s)
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Excel Upload */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Upload Excel File
          </h2>
          
          {selectedTemplate ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Download Template
                </label>
                <button
                  onClick={handleDownloadTemplate}
                  className="btn-secondary flex items-center w-full justify-center"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Excel Template
                </button>
                <p className="mt-1 text-xs text-gray-500">
                  Download the template, fill in your data, then upload it back.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Filled Excel File
                </label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 cursor-pointer"
                  onClick={() => document.getElementById('excel-file-input')?.click()}
                >
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="mt-2 text-sm font-medium text-gray-900">
                    {uploadedFile ? uploadedFile.name : 'Click to upload Excel file'}
                  </div>
                  <input
                    id="excel-file-input"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    .xlsx or .xls files only
                  </p>
                </div>
              </div>

              {uploadedFile && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-800">File Uploaded Successfully</h4>
                  <p className="text-sm text-green-700 mt-1">
                    {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Select a template first</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose a template to download the Excel format.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Attachments Selection */}
      {selectedTemplate && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Paperclip className="mr-2 h-5 w-5" />
            Choose Attachments (Optional)
          </h2>
          
          {!Array.isArray(attachments) || attachments.length === 0 ? (
            <div className="text-center py-8">
              <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No attachments</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload files in the Attachments section.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Array.isArray(attachments) && attachments.map((attachment) => (
                <label key={attachment.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAttachments.includes(attachment.id)}
                    onChange={() => handleAttachmentToggle(attachment.id)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{attachment.originalName}</p>
                    <p className="text-xs text-gray-500">
                      {(attachment.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Send/Draft Buttons */}
      {selectedTemplate && uploadedFile && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Ready to Process Mass Emails</h3>
              <p className="text-sm text-gray-600 mb-1">
                Template: {selectedTemplate.name} | 
                Attachments: {selectedAttachments.length} | 
                File: {uploadedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                <span className="font-medium">Save as Drafts:</span> Create drafts in Gmail for review before sending | 
                <span className="font-medium"> Send Immediately:</span> Send all emails now
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSaveAsDrafts}
                disabled={loading || savingDrafts}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                {savingDrafts ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving as Drafts...
                  </>
                ) : (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Save as Drafts
                  </>
                )}
              </button>
              <button
                onClick={handleSendMassEmail}
                disabled={loading || savingDrafts}
                className="btn-primary flex items-center disabled:bg-blue-400"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Immediately
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MassEmail;
