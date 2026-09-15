import { useState } from 'react';

function JobForm({ onJobCreated }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setFormError('Please enter a job title');
      return;
    }
    if (!type.trim()) {
      setFormError('Please select a job type');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      await onJobCreated({ title: title.trim(), type: type.trim() });
      setTitle('');
      setType('email');
    } catch (err) {
      setFormError('Failed to create job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="job-form" onSubmit={handleSubmit}>
      <h3 className="form-title">Create New Job</h3>

      {formError && <div className="form-error-msg">{formError}</div>}

      <div className="form-fields">
        <div className="form-group">
          <label htmlFor="job-title">Job Title</label>
          <input
            id="job-title"
            type="text"
            placeholder="e.g. Process Monthly Payroll, Send Onboarding Email..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label htmlFor="job-type">Job Type</label>
          <select
            id="job-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="email">✉️ Email Delivery</option>
            <option value="report">📊 Report Generation</option>
            <option value="backup">💾 Database Backup</option>
            <option value="export">📁 Data Export</option>
            <option value="media">🎬 Media Processing</option>
            <option value="cleanup">🧹 System Maintenance</option>
          </select>
        </div>

        <button
          id="btn-create-job"
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || !title.trim()}
        >
          {isSubmitting ? 'Creating...' : '+ Create Job'}
        </button>
      </div>
    </form>
  );
}

export default JobForm;
