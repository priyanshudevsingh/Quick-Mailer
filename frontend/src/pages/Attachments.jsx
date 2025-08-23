import { useState, useEffect, useRef } from 'react';
import { uploadAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Paperclip, Upload, Trash2, Download, FileText, Image, File, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { refreshDashboardStats } from '../utils/statsUtils';

const Attachments = () => {
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, attachmentId: null, attachmentName: '' });
  const [dragActive, setDragActive] = useState(false);
  const [editingDescription, setEditingDescription] = useState(null);
  const fileInputRef = useRef(null);

  // Helper function to get formatted time ago
  const getTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown';
    }
  };

  useEffect(() => {
    loadAttachments();
  }, []);

  const loadAttachments = async () => {
    try {
      const response = await uploadAPI.getAll();
      
      // Handle the API response structure - backend returns {attachments: [...]}
      const attachmentsData = response.data.data?.attachments || response.data.attachments || response.data;
      setAttachments(Array.isArray(attachmentsData) ? attachmentsData : []);
    } catch (error) {
      console.error('Failed to load attachments:', error);
      toast.error('Failed to load attachments');
    }
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // Upload files one by one since the API expects single file uploads
      const uploadPromises = Array.from(files).map(file => uploadAPI.uploadFile(file));
      await Promise.all(uploadPromises);
      
      toast.success(`${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully!`);
      // Refresh dashboard stats when attachments are uploaded
      refreshDashboardStats();
      await loadAttachments();
    } catch (error) {
      console.error('Failed to upload files:', error);
      toast.error(error.response?.data?.error || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (attachment) => {
    setDeleteModal({
      show: true,
      attachmentId: attachment.id,
      attachmentName: attachment.filename || attachment.name || 'Unknown file'
    });
  };

  const confirmDelete = async () => {
    try {
      await uploadAPI.delete(deleteModal.attachmentId);
      toast.success('Attachment deleted successfully!');
      setDeleteModal({ show: false, attachmentId: null, attachmentName: '' });
      // Refresh dashboard stats when attachment is deleted
      refreshDashboardStats();
      loadAttachments();
    } catch (error) {
      console.error('Failed to delete attachment:', error);
      toast.error('Failed to delete attachment');
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, attachmentId: null, attachmentName: '' });
  };

  const handleDescriptionEdit = (attachmentId) => {
    setEditingDescription(attachmentId);
  };

  const saveDescription = async (attachmentId, description) => {
    try {
      await uploadAPI.update(attachmentId, { description });
      
      // Update the local attachments state
      setAttachments(prev => prev.map(att => 
        att.id === attachmentId 
          ? { ...att, description } 
          : att
      ));
      
      setEditingDescription(null);
      toast.success('Description updated successfully!');
    } catch (error) {
      console.error('Failed to update description:', error);
      toast.error('Failed to update description');
    }
  };

  const cancelDescriptionEdit = () => {
    setEditingDescription(null);
  };

  const handleDownload = async (attachment) => {
    try {
      const response = await uploadAPI.download(attachment.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.originalName || attachment.filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('File downloaded successfully!');
    } catch (error) {
      console.error('Failed to download file:', error);
      toast.error('Failed to download file');
    }
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    } else if (mimetype.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else {
      return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">File Attachments</h1>
          <p className="text-gray-600">Upload and manage your file attachments</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-primary flex items-center"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Files
        </button>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center mb-8 transition-colors ${
          dragActive 
            ? 'border-primary-400 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
          <Paperclip className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Drop files here or click to upload
        </h3>
        <p className="text-gray-600 mb-4">
          Support for multiple files. Max size: 10MB per file.
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Choose Files'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
          accept="*/*"
        />
      </div>

      {/* Attachments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {(attachments || []).map((attachment) => {
          const timeAgo = getTimeAgo(attachment.createdAt || attachment.uploadedAt);
          const currentDescription = attachment.description || '';
          
          return (
            <div key={attachment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 h-fit">
              <div className="p-6 break-words">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg mr-3">
                      {getFileIcon(attachment.mimetype)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 break-words leading-tight" title={attachment.originalName}>
                        {attachment.originalName}
                      </h3>
                      <p className="text-sm text-gray-500">{formatFileSize(attachment.size)}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownload(attachment)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(attachment)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-gray-500">Type: {attachment.mimetype}</span>
                  </div>
                  
                  {/* Description Section */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      {editingDescription !== attachment.id && (
                        <button
                          onClick={() => handleDescriptionEdit(attachment.id)}
                          className="text-xs text-primary-600 hover:text-primary-800"
                        >
                          {currentDescription ? 'Edit' : 'Add'}
                        </button>
                      )}
                    </div>
                    
                    {editingDescription === attachment.id ? (
                      <div className="space-y-2">
                        <textarea
                          className="w-full p-2 text-sm border border-gray-300 rounded-lg resize-none"
                          rows="2"
                          placeholder="Add a description for this file..."
                          defaultValue={currentDescription}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              saveDescription(attachment.id, e.target.value);
                            } else if (e.key === 'Escape') {
                              cancelDescriptionEdit();
                            }
                          }}
                          autoFocus
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={cancelDescriptionEdit}
                            className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={(e) => {
                              const textarea = e.target.closest('.space-y-2').querySelector('textarea');
                              saveDescription(attachment.id, textarea.value);
                            }}
                            className="px-3 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2 min-h-[2.5rem]">
                        {currentDescription || 'No description added'}
                      </p>
                    )}
                  </div>
                  
                  {/* Timestamp at bottom right */}
                  <div className="flex items-center justify-end pt-3 border-t border-gray-100">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      <span className="font-medium">Uploaded</span>
                      <span className="ml-1">{timeAgo}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {(attachments || []).length === 0 && (
        <div className="text-center py-12">
          <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
            <Paperclip className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No attachments yet</h3>
          <p className="text-gray-600 mb-6">Upload your first file to get started</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary flex items-center mx-auto"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-4"></div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Uploading files...</h3>
                <p className="text-sm text-gray-600">Please wait while we upload your files</p>
              </div>
            </div>
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
                  <h3 className="text-lg font-semibold text-gray-900">Delete Attachment</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete the attachment <span className="font-medium">"{deleteModal.attachmentName}"</span>?
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
                  Delete Attachment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attachments;
