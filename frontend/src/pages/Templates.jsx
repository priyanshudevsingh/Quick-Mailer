import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { templatesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FileText, Plus, Edit, Trash2, X, Bold, Italic, Underline, Clock, Type } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import RichTextEditor from '../components/RichTextEditor';
import { useRefreshDashboardStats } from '../utils/statsUtils';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const refreshDashboardStats = useRefreshDashboardStats();
  const [loading, setLoading] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [placeholders, setPlaceholders] = useState([]);
  const [error, setError] = useState(null);
  
  // Local state for form values to ensure they're always properly initialized
  const [formName, setFormName] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formBody, setFormBody] = useState('');

  // Custom modal states
  const [deleteModal, setDeleteModal] = useState({ show: false, templateId: null, templateName: '' });
  const [placeholderModal, setPlaceholderModal] = useState({ show: false, callback: null });
  const [placeholderInput, setPlaceholderInput] = useState('');

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      subject: '',
      body: ''
    }
  });



  useEffect(() => {
    loadTemplates();
  }, []);

  // Helper function to get formatted time ago
  const getTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown';
    }
  };

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      setError(null);
      const response = await templatesAPI.getAll();
      
      // Handle the API response structure - backend returns {templates: [...]}
      const templatesData = response.data.data?.templates || response.data.templates || response.data;
      setTemplates(Array.isArray(templatesData) ? templatesData : []);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setError('Failed to load templates');
      toast.error('Failed to load templates');
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleBodyChange = (htmlContent) => {
    try {
      // Ensure we always have a valid string
      const safeContent = typeof htmlContent === 'string' ? htmlContent : '';
      setFormBody(safeContent);
      // Update React Hook Form field value to trigger validation
      setValue('body', safeContent);
      const extractedPlaceholders = extractPlaceholders(safeContent);
      setPlaceholders(extractedPlaceholders);
    } catch (error) {
      console.error('Error handling body change:', error);
      setError('Error processing template content');
      // Set a safe default
      setFormBody('');
      setValue('body', '');
      setPlaceholders([]);
    }
  };

  const extractPlaceholders = (htmlContent) => {
    try {
      // Extract placeholders from HTML content, handling both HTML and plain text
      const placeholderRegex = /\{\{([^}]+)\}\}/g;
      const matches = htmlContent.match(placeholderRegex);
      if (!matches) return [];
      
      // Remove duplicates and return unique placeholders
      const uniquePlaceholders = [...new Set(matches.map(match => match.slice(2, -2)))];
      return uniquePlaceholders;
    } catch (error) {
      console.error('Error extracting placeholders:', error);
      return [];
    }
  };

  const onSubmit = async (data) => {
    try {
      // Validate body content
      if (!formBody || typeof formBody !== 'string' || formBody.trim() === '') {
        toast.error('Email body is required');
        return;
      }

      setLoading(true);
      setError(null);
      
      const templateData = {
        name: formName,
        subject: formSubject,
        body: formBody,
        placeholders: placeholders
      };
      
      if (editingTemplate) {
        await templatesAPI.update(editingTemplate.id, templateData);
        toast.success('Template updated successfully!');
        // Refresh dashboard stats when template is updated
        refreshDashboardStats();
      } else {
        await templatesAPI.create(templateData);
        toast.success('Template created successfully!');
        // Refresh dashboard stats when template is created
        refreshDashboardStats();
      }
      
      setShowForm(false);
      setEditingTemplate(null);
      setFormName('');
      setFormSubject('');
      setFormBody('');
      // Reset React Hook Form values
      reset();
      setPlaceholders([]);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to save template:', error);
      setError(error.response?.data?.error || 'Failed to save template');
      toast.error(error.response?.data?.error || 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template) => {
    try {
      setEditingTemplate(template);
      setFormName(template.name || '');
      setFormSubject(template.subject || '');
      setFormBody(template.body || '');
      // Update React Hook Form field values
      setValue('name', template.name || '');
      setValue('subject', template.subject || '');
      setValue('body', template.body || '');
      setPlaceholders(template.placeholders || []);
      setShowForm(true);
      setError(null);
    } catch (error) {
      console.error('Error editing template:', error);
      setError('Error loading template for editing');
    }
  };

  const handleDelete = (template) => {
    setDeleteModal({ 
      show: true, 
      templateId: template.id, 
      templateName: template.name 
    });
  };

  const confirmDelete = async () => {
    try {
      setError(null);
      await templatesAPI.delete(deleteModal.templateId);
      toast.success('Template deleted successfully!');
      setDeleteModal({ show: false, templateId: null, templateName: '' });
      // Refresh dashboard stats when template is deleted
      refreshDashboardStats();
      loadTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
      setError('Failed to delete template');
      toast.error('Failed to delete template');
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, templateId: null, templateName: '' });
  };

  const handleAddPlaceholder = (callback) => {
    setPlaceholderModal({ show: true, callback });
    setPlaceholderInput('');
  };

  const confirmPlaceholder = () => {
    const trimmedInput = placeholderInput.trim();
    if (trimmedInput && placeholderModal.callback) {
      placeholderModal.callback(trimmedInput);
    }
    setPlaceholderModal({ show: false, callback: null });
    setPlaceholderInput('');
  };

  const cancelPlaceholder = () => {
    setPlaceholderModal({ show: false, callback: null });
    setPlaceholderInput('');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTemplate(null);
    setFormName('');
    setFormSubject('');
    setFormBody('');
    // Reset React Hook Form values
    reset();
    setPlaceholders([]);
    setError(null);
  };

  // Function to open new template form
  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setFormName('');
    setFormSubject('');
    setFormBody('');
    // Reset React Hook Form values
    reset();
    setPlaceholders([]);
    setError(null);
    setShowForm(true);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Templates</h1>
          <p className="text-gray-600">Create and manage your email templates with placeholders</p>
        </div>
        <button
          onClick={handleNewTemplate}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadTemplates}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Templates Grid */}
      {!loadingTemplates && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {(templates || []).map((template) => {
            try {
              // Ensure template has required properties
              if (!template || typeof template !== 'object' || !template.id) {
                return null;
              }
              
              const templateName = typeof template.name === 'string' ? template.name : 'Unnamed Template';
              const templateSubject = typeof template.subject === 'string' ? template.subject : 'No subject';
              const templateBody = typeof template.body === 'string' ? template.body : '';
              const templatePlaceholders = Array.isArray(template.placeholders) ? template.placeholders : [];
              
              // Determine which timestamp to show (edited if updated recently, otherwise created)
              const createdAt = template.createdAt;
              const updatedAt = template.updatedAt;
              const wasEdited = createdAt !== updatedAt;
              const displayTime = wasEdited ? updatedAt : createdAt;
              const timeLabel = wasEdited ? 'Edited' : 'Created';
              const timeAgo = getTimeAgo(displayTime);
              
              return (
                <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 h-fit">
                  {/* Template content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{templateName}</h3>
                        <p className="text-sm text-gray-600 mb-3">{templateSubject}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(template)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit template"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(template)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Placeholders</span>
                        <span className="text-xs text-gray-400">{templatePlaceholders.length}</span>
                      </div>
                      {templatePlaceholders.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {templatePlaceholders.slice(0, 3).map((placeholder, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                            >
                              {placeholder}
                            </span>
                          ))}
                          {templatePlaceholders.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              +{templatePlaceholders.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No placeholders</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{timeLabel}</span>
                        <span className="ml-1">{timeAgo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            } catch (error) {
              console.error('Error rendering template:', error, template);
              return (
                <div key={`error-${Math.random()}`} className="bg-red-50 rounded-xl border border-red-200 p-6">
                  <p className="text-red-800">Error rendering template</p>
                </div>
              );
            }
          })}
        </div>
      )}

      {/* Empty State */}
      {!loadingTemplates && (templates || []).length === 0 && !showForm && (
        <div className="text-center py-12">
          <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-600 mb-6">Create your first email template to get started</p>
          <button
            onClick={handleNewTemplate}
            className="btn-primary flex items-center mx-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </button>
        </div>
      )}

      {/* Loading State */}
      {loadingTemplates && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      )}

      {/* Template Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTemplate ? 'Edit Template' : 'New Template'}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Only render form when all values are properly initialized */}
            {typeof formName === 'string' && typeof formSubject === 'string' && typeof formBody === 'string' ? (
              <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => {
                        setFormName(e.target.value);
                        setValue('name', e.target.value);
                      }}
                      className="input-field"
                      placeholder="Enter template name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {typeof errors.name.message === 'string' ? errors.name.message : 'Template name is required'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      value={formSubject}
                      onChange={(e) => {
                        setFormSubject(e.target.value);
                        setValue('subject', e.target.value);
                      }}
                      className="input-field"
                      placeholder="Enter email subject"
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600">
                        {typeof errors.subject.message === 'string' ? errors.subject.message : 'Email subject is required'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Body <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    value={formBody}
                    onChange={handleBodyChange}
                    placeholder="Enter email body (use {{placeholder}} for variables)"
                    onAddPlaceholder={handleAddPlaceholder}
                  />
                  <input
                    type="hidden"
                    {...register('body', { required: 'Email body is required' })}
                    value={formBody}
                  />
                  {errors.body && (
                    <p className="mt-1 text-sm text-red-600">
                      {typeof errors.body.message === 'string' ? errors.body.message : 'Email body is required'}
                    </p>
                  )}
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-800">
                      <strong>💡 Tips:</strong> Use the toolbar to format text (bold, italic, etc.). 
                      Click the <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono bg-blue-200 text-blue-800">{'{{}}}'}</span> button to add placeholders like {'{{customer_name}}'}, {'{{company}}'}, {'{{date}}'}.
                    </p>
                  </div>
                </div>

                {Array.isArray(placeholders) && placeholders.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Detected Placeholders</h3>
                    <div className="flex flex-wrap gap-2">
                      {placeholders.map((placeholder, index) => {
                        // Ensure placeholder is a valid string
                        if (typeof placeholder !== 'string' || !placeholder.trim()) {
                          return null;
                        }
                        return (
                          <span
                            key={placeholder}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                          >
                            {placeholder}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Live Preview */}
                {formBody && typeof formBody === 'string' && formBody.trim() !== '' && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Live Preview</h3>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: formBody }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-8">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Saving...' : (editingTemplate ? 'Update Template' : 'Save Template')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading form...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg mr-3">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Template</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete the template <span className="font-medium">"{deleteModal.templateName}"</span>?
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Delete Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder Input Modal */}
      {placeholderModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-3">
                  <Type className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Add Placeholder</h3>
                  <p className="text-sm text-gray-500">Enter the placeholder name</p>
                </div>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                confirmPlaceholder();
              }}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Placeholder Name (without braces)
                  </label>
                  <input
                    type="text"
                    value={placeholderInput}
                    onChange={(e) => setPlaceholderInput(e.target.value)}
                    className="input-field"
                    placeholder="e.g., customer_name, company, date"
                    autoFocus
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This will be inserted as <span className="font-mono bg-gray-100 px-1 rounded">{'{{placeholder_name}}'}</span>
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={cancelPlaceholder}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!placeholderInput.trim()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Placeholder
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
